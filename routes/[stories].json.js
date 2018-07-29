import { driver } from '../server/db/arangodb-driver'
const db = driver.connect()

export async function get(req, res) {
	const cursor = await db.query(`
		FOR document IN stories
			LIMIT 100
			RETURN document
	`)
	const stories = await cursor.all()
	res.writeHead(200, { 'Content-Type': 'application/json' })
	res.end(JSON.stringify(stories))
}
