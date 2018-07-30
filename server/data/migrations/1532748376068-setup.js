import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'
import config from '../../build/config'
import { log, papaParseAsync } from '../../utils/migration-tools'
import _ from 'lodash'
import { driver } from '../../db/arangodb-driver'
import {
	users as usersData,
	stories as storiesData,
	clips as clipsData,
} from '../migrations-data/1532748376068-setup'
const db = driver.connect()

db.useDatabase(config.ARANGODB_DB)
const ProfilesGraph = db.graph('profilesGraph')
const StoriesGraph = db.graph('storiesGraph')

export const up = async function() {

	try {

		// ------------------------------ >>>
		// create some edge definitions
		// ------------------------------ >>>

		const profileGraphinfo = await ProfilesGraph.create({
			edgeDefinitions: [{
				collection: 'userFollowsUser',
				from: ['users'],
				to: ['users'],
			}, {
				collection: 'userHasStory',
				from: ['users'],
				to: ['stories'],
			}],
		})
		log(profileGraphinfo, 'ProfilesGraph.create info')

		const storyGraphinfo = await StoriesGraph.create({
			edgeDefinitions: [{
				collection: 'storyHasClip',
				from: ['stories'],
				to: ['clips'],
			}, {
				collection: 'clipHasClip',
				from: ['clips'],
				to: ['clips'],
			}],
		})
		log(storyGraphinfo, 'StoriesGraph.create info')

		// ------------------------------ >>>
		// first story data
		// ------------------------------ >>>

		const Stories = StoriesGraph.vertexCollection('stories')
		log(await Stories.import(storiesData), 'first story imported')

		// ------------------------------ >>>
		// users, users follows
		// ------------------------------ >>>

		const Users = ProfilesGraph.vertexCollection('users')
		log(await Users.import(usersData), 'first users imported')
		const userNodes = await (await Users.all()).all()
		log(userNodes, 'actual nodes fetched')

		const Robert = _.find(userNodes, { _key: 'robert' })
		const Doug = _.find(userNodes, { _key: 'doug' })
		const David = _.find(userNodes, { _key: 'david' })

		const FollowsEdges = ProfilesGraph.edgeCollection('userFollowsUser')
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
		// user has stories
		// ------------------------------ >>>

		const UserStoryEdges = ProfilesGraph.edgeCollection('userHasStory')
		log(await UserStoryEdges.import([{
			_from: Robert._id,
			_to: 'stories/the-first-floogar-adventure',
			vertex: Robert._key,
		}, {
			_from: David._id,
			_to: 'stories/raiders-of-the-lost-ark',
			vertex: David._key,
		}, {
			_from: Robert._id,
			_to: 'stories/the-empire-strikes-back',
			vertex: Robert._key,
		}]),
		'user has story edges imported')

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
	log(await ProfilesGraph.drop(true), '`profilesGraph` dropped')
	log(await StoriesGraph.drop(true), '`storiesGraph` dropped')
}
