const tinycolor = require('tinycolor2')

module.exports.plugins = [
	require('postcss-easy-import')({
		path: ['client/postcss', 'router'],
		extensions: ['.css', '.scss', '.postcss'],
		prefix: '_',
	}),
	require('postcss-functions')({
		functions: {
			// url: path => {
			// 	return `url('../${path.replace(/["']/g, '')}')`
			// },
			urlstatic: path => {
				return `url(${path})`
			},
			em: (fontSize, parentFontSize) => {
				parentFontSize = parentFontSize || 10
				return (Math.round(fontSize / parentFontSize * 1000) / 1000) + 'em'
			},
			fw: (targetFontSize, targetViewportWidth) => {
				targetViewportWidth = targetViewportWidth || 1000
				return (Math.round(1000 / targetViewportWidth * targetFontSize / 10 * 1000) / 1000) + 'vw'
			},
			lh: (fontSize, lineHeight) => {
				return Math.round(lineHeight / fontSize * 100) / 100
			},
			ratio: (divider, divided) => {
				return Number((divider / divided * 100).toFixed(3)) + '%'
			},
			tinycolor: (color, method, ...theArgs) => {
				return tinycolor(color)[method](...theArgs)/* .toString() */
			},
			percent: (maths, placeValue) => {
				placeValue = placeValue || 100
				return `resolve(round(${maths} * 100 * ${placeValue}) / ${placeValue})%`
			},
		},
	}),
	require('postcss-custom-media'),
	require('postcss-media-minmax'),
	require('postcss-nested'),
	require('postcss-simple-vars'),
	require('postcss-math'),
	// (!isLib && require('autoprefixer')),
	// require('autoprefixer'),
	require('postcss-strip-inline-comments'),
	require('postcss-reporter'),
]
