const fs = require('fs')
const glob = require('glob')
const path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader') // for https://github.com/webpack/webpack/issues/3460

module.exports = {

	entry: glob.sync('{tests/**/*.js,!tests/lib/**}').map(function(s) {
		return './' + s;
	}),

	externals: {
		jquery: {
			commonjs: 'jquery',
			commonjs2: 'jquery',
			amd: 'jquery',
			root: 'jQuery'
		},
		moment: 'moment',

		// plugins reference the root 'fullcalendar' namespace
		fullcalendar: {
			commonjs: 'fullcalendar',
			commonjs2: 'fullcalendar',
			amd: 'fullcalendar',
			root: 'FullCalendar'
		}
	},

	resolve: {
		extensions: ['.ts', '.js'],
	},

	module: {
		rules: [
			{
				test: /\.(ts|js)$/,
				loader: 'awesome-typescript-loader'
			}
		]
	},

	plugins: [
		new CheckerPlugin()
	],

	output: {
		libraryTarget: 'umd',
		filename: 'compiled-tests.js',
		path: path.resolve(__dirname, 'tmp/'),
		devtoolModuleFilenameTemplate: 'webpack:///tests/[resource-path]'
	}

}
