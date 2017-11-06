const path = require('path')

// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {

	resolve: {
		extensions: ['.ts', '.js'],
		alias: {
			jquery: path.resolve(__dirname, 'src/jquery-shim.js'),
			moment: path.resolve(__dirname, 'src/moment-shim.js')
		}
	},

	module: {
		loaders: [
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader'
			}
		]
	},

	plugins: [
		new CheckerPlugin()
	]

};
