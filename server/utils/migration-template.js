import { log } from '../../utils/migration-tools'
import { driver } from '../../db/arangodb-driver'
const db = driver.connect()

// const Graph = db.graph('graph')
// const Collection = db.collection('collection')

export const up = async function(/* next */) {

	try {

		// ------------------------------ >>>
		// data loading
		// ------------------------------ >>>

		// const migrationData = require('../arangodb/___')

		// ------------------------------ >>>
		// main_action
		// ------------------------------ >>>

		// ----- >>> sub_actions

		// log()

	} catch (error) {
		console.log('ERROR:', error)
	}

	// next()
}

export const down = async function(/* next */) {
	// log()
	// next()
}
