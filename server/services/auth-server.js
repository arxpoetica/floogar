import config from '../build/config'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Strategy as LocalStrategy } from 'passport-local'
// import { Strategy as GitHubStrategy } from 'passport-github'
import { driver } from '../db/arangodb-driver'
const db = driver.connect()
const Users = db.collection('users')
const env = process.env.NODE_ENV

export async function setupAuth(app) {

	// SEE: https://medium.com/front-end-hacking/learn-using-jwt-with-passport-authentication-9761539c4314

	passport.use(new LocalStrategy(async(username, password, done) => {
		// console.log(' --->>> LocalStrategy'.green)
		// console.log('username:', username)
		// console.log('password:', password)
		try {
			const cursor = await Users.byExample({ _key: username })
			if (cursor.count === 1) {
				const user = await cursor.next()

				const match = await bcrypt.compare(password, user.hash)
				if (!match) {
					return done(null, false, { message: `${user.username} is not authentic to that password.` })
				}

				user.username = user._key
				delete user._id
				delete user._key
				delete user._rev
				delete user.hash
				// delete user.created
				delete user.modified
				done(null, user)
			} else {
				return done(null, false, { message: `${username} does not exist. Make it so?` })
			}
		} catch (error) {
			done(error)
		}
	}))

	// passport.use(new GitHubStrategy({
	// 	clientID: config.GITHUB_CLIENT_ID,
	// 	clientSecret: config.GITHUB_CLIENT_SECRET,
	// 	callbackURL: '/auth/github/callback',
	// 	// userAgent: 'svelte.technology'
	// }, (accessToken, refreshToken, profile, callback) => {
	// 	return callback(null, {
	// 		token: accessToken,
	// 		id: profile.id,
	// 		username: profile.username,
	// 		displayName: profile.displayName,
	// 		photo: profile.photos && profile.photos[0] && profile.photos[0].value,
	// 	})
	// }))

	app.use(passport.initialize())

	app.post('/auth/local/signin', function(req, res) {
		passport.authenticate('local', {
			session: false,
			successRedirect: '/',
			failureRedirect: '/signin',
		}, (err, user) => {
			if (err || !user) {
				return res.status(400).json({
					message: 'Something went wrong.',
					user: user ? user : false,
				})
			}
			req.login(user, { session: false }, error => {
				if (error) {
					res.send(error)
				}
				// generate a signed son web token with the contents of user object and return it in the response
				const month = 60 * 60 * 24 * 30
				const token = jwt.sign(user, config.JWT_SECRET, { expiresIn: month })
				return res.cookie('ds', token, {
					// httpOnly: false,
					secure: env === 'production' ? true : false,
					maxAge: 1000 * month,
				}).json(user)
			})
		})(req, res)
	})

	app.post('/auth/signout', (req, res) => {
		// FIXME: destroy the local token ??? I don't think this is a thing...
		req.logout()
		res.end('ok')
	})

}
