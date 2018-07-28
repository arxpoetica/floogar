const fs = require('fs')

const parts = process.env.f.split('/')
const name = parts[parts.length - 1].split('.js')[0]
const template = require(`../../client/json/${name}`)()
const result = JSON.stringify(template, null, '\t')

fs.writeFile(`assets/json/${name}.json`, result, function(err) {
	if (err) {
		return console.log(err)
	}
	console.log('The file was saved!')
})
