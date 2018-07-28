const webpack = require('webpack');
const config = require('sapper/webpack/config.js');
const sharedConfig = require('./shared-config')

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const isDev = mode === 'development';
const FIXME = process.env.FIXME

module.exports = {
	entry: config.client.entry(),
	output: config.client.output(),
	resolve: {
		extensions: ['.js', '.json', '.html', '.sv', '.svelte', '.svg'],
		mainFields: ['svelte', 'module', 'browser', 'main'],
	},
	module: {
		rules: [
			{
				test: /\.(html|sv|svelte|svg)$/,
				use: {
					loader: 'svelte-loader',
					options: {
						dev: isDev && !FIXME,
						hydratable: true,
						hotReload: true,
						preprocess: {
							style: sharedConfig.style,
						},
					},
				},
			},
		]
	},
	mode,
	plugins: [
		isDev && !FIXME && new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.browser': true,
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		}),
	].filter(Boolean),
	devtool: isDev && !FIXME && 'inline-source-map'
};
