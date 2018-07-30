import { driver } from '../server/db/arangodb-driver'
const db = driver.connect()

export async function get(req, res) {
	// const cursor = await db.query(`
	// 	FOR story IN stories
	// 		LIMIT 100
	// 		FOR edge IN userHasStory
	// 			FILTER edge._to == story._id
	// 			FOR user IN users
	// 				FILTER edge._from == user._id
	// 				RETURN {
	// 					"story" : story,
	// 					"user": user
	// 				}
	// `)

	const cursor = await db.query(`
		FOR story IN stories
			LIMIT 100
			FOR user IN INBOUND story
				userHasStory
				RETURN { story: story, user: user }
	`)
	const data = await cursor.all()
	res.writeHead(200, { 'Content-Type': 'application/json' })
	res.end(JSON.stringify(data.map(set => {
		set.story.user = set.user
		return set.story
	})))
}
