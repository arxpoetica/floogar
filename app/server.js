// FIXME: config should work
// import config from '../server/build/config'
import 'colors'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import sirv from 'sirv'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { setupAuth } from '../server/services/auth-server'
import { graphqlSetup } from '../server/services/graphql-setup'
import sapper from 'sapper'
import { Store } from 'svelte/store.js'
import { manifest } from './manifest/server.js'

const env = process.env.NODE_ENV
const development = env === 'development'
const FIXME = process.env.FIXME

// https://www.joyent.com/node-js/production/design/errors
// TODO: https://shapeshed.com/uncaught-exceptions-in-node/
// handle all uncaught exceptions
// see - https://nodejs.org/api/process.html#process_event_uncaughtexception
process.on('uncaughtException', error => console.error('Uncaught Exception:'.red, error))
// handle all unhandled promise rejections
// see - http://bluebirdjs.com/docs/api/error-management-configuration.html#global-rejection-events
// or for latest node - https://nodejs.org/api/process.html#process_event_unhandledrejection
process.on('unhandledRejection', error => console.error('Unhandled Rejection:'.red, error))

// ---> FOOTGUN!?
async function start() {

	// NOTE: order matters!!! https://github.com/jaredhanson/passport/issues/14#issuecomment-4863459
	const app = express()

	if ((development && !FIXME) || process.env.DO_NOT_USE_MORGAN) {
		app.use(function(req, res, next) {
			console.log('handling request for: '.magenta + req.url)
			next()
		})
	} else {
		app.use(morgan('combined'))
	}

	// SEE: https://expressjs.com/en/advanced/best-practice-security.html
	app.use(helmet())
	app.set('trust proxy', 1) // trust first proxy

	app.use(compression({ threshold: 0 }))
	app.use(sirv('assets'))
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))
	app.use(cookieParser())

	await setupAuth(app)
	await graphqlSetup(app)

	app.use(sapper({
		store: (/* req */) => new Store({}), // don't need anything yet...but maybe we should always update the auth?
		manifest,
	}))

	app.listen(process.env.PORT, setTimeout(() => {
		console.log()
		console.log('     ----- FLOOGAR -----'.blue)
		console.log()
		console.log('     listening on port '.green + process.env.PORT + ' in '.green + process.env.NODE_ENV + ' mode'.green)
		// console.log(JSON.stringify(process.env, null, 2))
		if (development) {
			console.log('     Running '.green + `http://localhost:${(process.env.PORT)}/graphiql` + ' in development mode only...'.green)
		}
		console.log()
	}, 100))

}

start()
