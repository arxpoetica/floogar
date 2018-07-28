require('colors')
const _ = require('lodash')
const Papa = require('papaparse')

module.exports.log = (logs, grouping) => {
	logs = Array.isArray(logs) ? logs : [logs]
	grouping = grouping || 'migration log'
	console.log()
	console.log(`----- >>> ${grouping}`.yellow)
	console.log()
	_.each(logs, log => console.dir(log, { depth: null, colors: true }))
}

module.exports.papaParseAsync = function(file, options) {
	options = options || {}
	return new Promise(function(complete, error) {
		options.complete = complete
		options.error = error
		Papa.parse(file, options)
	})
}
