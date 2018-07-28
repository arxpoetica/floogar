// https://docs.arangodb.com/devel/Drivers/JS/Reference

import config from '../build/config'
import arangojs from 'arangojs'

const driver = {

	db: undefined,

	connect: function() {
		if (this.db) { return this.db }
		this.db = arangojs({ url: `${config.ARANGODB_PROTOCOL}://${config.ARANGODB_HOST}:${config.ARANGODB_PORT}` })
		this.db.useDatabase(config.ARANGODB_DB)
		this.db.useBasicAuth(config.ARANGODB_USERNAME, config.ARANGODB_PASSWORD)
		return this.db
	},

}

export { driver }
