import 'colors'
import config from '../build/config'
import arangojs from 'arangojs'
import yesno from 'yesno'

const name = config.ARANGODB_DB

yesno.ask(`\n\nCreate ArangoDB database '${name}'?`.yellow, false, async(ok) => {
	if (ok) {
		const db = arangojs({ url: `${config.ARANGODB_PROTOCOL}://${config.ARANGODB_HOST}:${config.ARANGODB_PORT}` })
		const databases = await db.listDatabases()
		if (databases.indexOf(name) > -1) {
			console.log(`  -- ERROR: database '${name}' already exists!!!`.red)
			console.log('  -- if you need to overwrite this database, please do so manually.\n\n'.yellow)
		} else {
			await db.createDatabase(name)
			console.log(`  -- Congratulations! 💾 💾 💾 Created database '${name}'!\n\n`.green)
		}
		process.exit(0)
	} else {
		console.log('  -- Did not create database.\n\n'.red)
		process.exit(0)
	}
})
