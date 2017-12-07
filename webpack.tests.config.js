const { CheckerPlugin } = require('awesome-typescript-loader') // for https://github.com/webpack/webpack/issues/3460

module.exports = {

	// entry provided by gulp task

	externals: {
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
		devtoolModuleFilenameTemplate: 'webpack:///tests/[resource-path]'
	}

}
