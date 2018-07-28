import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'
import config from '../../build/config'
import { log, papaParseAsync } from '../../utils/migration-tools'
import _ from 'lodash'
import { driver } from '../../db/arangodb-driver'
const db = driver.connect()

db.useDatabase(config.ARANGODB_DB)
const ProfilesGraph = db.graph('profiles-graph')

export const up = async function() {

	try {

		// ------------------------------ >>>
		// create some edge definitions
		// ------------------------------ >>>

		const profileGraphinfo = await ProfilesGraph.create({
			edgeDefinitions: [{
				collection: 'user-follows-user',
				from: ['users'],
				to: ['users'],
			}, {
				collection: 'user-has-floogar',
				from: ['users'],
				to: ['floogars'],
			}],
		})
		log(profileGraphinfo, 'ProfilesGraph.create info')

		// ------------------------------ >>>
		// users and users follows
		// ------------------------------ >>>

		const migrationData = require('../migrations-data/1532748376068-setup')

		const Users = ProfilesGraph.vertexCollection('users')
		log(await Users.import(migrationData.users), 'first users imported')
		const userNodes = await (await Users.all()).all()
		log(userNodes, 'actual nodes fetched')

		const Robert = _.find(userNodes, { _key: 'robert' })
		const Doug = _.find(userNodes, { _key: 'doug' })
		const David = _.find(userNodes, { _key: 'david' })

		const FollowsEdges = ProfilesGraph.edgeCollection('user-follows-user')
		log(await FollowsEdges.import([{
			_from: Robert._id,
			_to: Doug._id,
			vertex: Robert._key,
		}, {
			_from: Robert._id,
			_to: David._id,
			vertex: Robert._key,
		}, {
			_from: Doug._id,
			_to: Robert._id,
			vertex: Doug._key,
		}, {
			_from: Doug._id,
			_to: David._id,
			vertex: Doug._key,
		}, {
			_from: David._id,
			_to: Robert._id,
			vertex: David._key,
		}, {
			_from: David._id,
			_to: Doug._id,
			vertex: David._key,
		}]),
		'follow edges imported')

		// ------------------------------ >>>
		// set passwords
		// ------------------------------ >>>

		const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
		const file = path.join(__dirname, `/../migrations-data/passwords.${env}.csv`)
		const passwords = await papaParseAsync(fs.createReadStream(file, 'utf8'), {
			header: true,
			dynamicTyping: true,
		})

		for (let user of passwords.data) {
			const hash = await bcrypt.hash(user.password, 10)
			const query = [
				`UPDATE DOCUMENT("users/${user.username}")`,
				`WITH { "hash": ${JSON.stringify(hash)} }`,
				'IN users',
				'RETURN NEW.hash',
			].join(' ')
			const cursor = await db.query(query)
			log(await cursor.all(), `${user.username} password updated:`)
		}

	} catch (error) {
		console.log('ERROR:', error)
	}

}

export const down = async function() {
	log(await ProfilesGraph.vertexCollection('users').drop(), '`users` vertex collection dropped')
	log(await ProfilesGraph.edgeCollection('user-follows-user').drop(), '`user-follows-user` edge collection dropped')
	log(await ProfilesGraph.vertexCollection('floogars').drop(), '`floogars` vertex collection dropped')
	log(await ProfilesGraph.edgeCollection('user-has-floogar').drop(), '`user-has-floogar` edge collection dropped')
	log(await ProfilesGraph.drop(), '`profiles-graph` dropped')
}
