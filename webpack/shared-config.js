require('../server/build/config-legacy') // non-es-6 config

const postcss = require('postcss')
const plugins = require('../server/build/postcss.config.vars').plugins

module.exports.style = ({ content/* , attributes, filename */ }) => {

	// if (attributes.type !== 'text/postcss') return;
	return new Promise((fulfil, reject) => {
		postcss(plugins)
			.process('@import \'routes-includes\';\n' + content, {
				from: 'src',
				syntax: require('postcss-scss'),
				map: true,
				// map: { inline: true },
				// map: { inline: false },
				// map: ctx.options.map,
			})
			.then(result => {
				// console.log(result.css)
				if (result.css && typeof result.css === 'string') {
					fulfil({
						code: result.css.toString(),
						// map: result.map.toString(),
					})
				} else {
					fulfil({ code: '', map: '' })
				}
			})
			.catch(err => reject(err))
	})
}
