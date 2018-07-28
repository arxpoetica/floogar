const config = require('sapper/webpack/config.js');
const pkg = require('../package.json');
const sharedConfig = require('./shared-config')

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const isDev = mode === 'development';
const FIXME = process.env.FIXME

module.exports = {
	entry: config.server.entry(),
	output: config.server.output(),
	target: 'node',
	resolve: {
		extensions: ['.js', '.json', '.html', '.sv', '.svelte', '.svg'],
		mainFields: ['svelte', 'module', 'browser', 'main'],
	},
	externals: Object.keys(pkg.dependencies),
	module: {
		rules: [
			{
				test: /\.(html|sv|svelte|svg)$/,
				use: {
					loader: 'svelte-loader',
					options: {
						css: false,
						generate: 'ssr',
						preprocess: {
							style: sharedConfig.style,
						},
					},
				},
			},
		],
		noParse: /\.gql$/,
	},
	mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
	performance: {
		hints: false // it doesn't matter if server.js is large
	},
	devtool: isDev && !FIXME && 'inline-source-map'
};