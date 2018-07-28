// TODO: OUTPUT IN DEVELOPMENT (AND PRODUCTION???) ARANGODB ACTIVITY LOGS
// TODO: OUTPUT IN DEVELOPMENT (AND PRODUCTION???) ARANGODB ACTIVITY LOGS
// TODO: OUTPUT IN DEVELOPMENT (AND PRODUCTION???) ARANGODB ACTIVITY LOGS

// import { aql } from 'arangojs'
import { driver } from './arangodb-driver'
const db = driver.connect()

export const api = {

	get: async function(collection, key) {
		if (!collection) { throw new Error('No collection set in `get`') }
		if (!key) { throw new Error('No key set in `get`') }
		const query = `
			FOR document IN \`${collection}\`
				FILTER document._key == @key
				RETURN document
		`
		const cursor = await db.query(query, { key })
		return cursor.next()
	},

	getAll: async function(collection, keys) {
		if (!collection) { throw new Error('No collection set in `getAll`') }
		keys = keys || []
		keys = Array.isArray(keys) ? keys : [keys]
		const query = `
			FOR document IN \`${collection}\`
				${keys.length ? 'FILTER document._key IN @keys' : ''}
				LIMIT 100
				RETURN document
		`
		const queryPromise = keys.length ? db.query(query, { keys }) : db.query(query)
		const cursor = await queryPromise
		return await cursor.all()
	},

	traverse: async function(originCollection, key, edgeCollection, depth) {
		if (!originCollection) { throw new Error('No origin collection set in `traverse`') }
		if (!key) { throw new Error('No key set in `traverse`') }
		if (!edgeCollection) { throw new Error('No edge collection set in `traverse`') }
		depth = depth || '1..1'
		const query = `
			FOR document IN ${depth} OUTBOUND "${originCollection}/${key}" \`${edgeCollection}\`
				LIMIT 100
				RETURN document
		`
		const cursor = await db.query(query)
		return await cursor.all()
	},

}
