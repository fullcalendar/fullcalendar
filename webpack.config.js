const path = require('path')

// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {

	entry: './src/main.ts',

	resolve: {
		extensions: ['.ts', '.js'],
		alias: {
			// use our slimmed down version
			// still need to npm-install the original though, for typescript transpiler
			tslib: path.resolve(__dirname, 'src/tslib-lite.js')
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
	],

	externals: {
		jquery: {
			commonjs: 'jquery',
			commonjs2: 'jquery', // ?, needed
			amd: 'jquery',
			root: 'jQuery' // on the window
		},
		moment: 'moment'
	},

	output: {
		libraryTarget: 'umd',
		filename: 'fullcalendar.js',
		path: path.resolve(__dirname, 'dist/')
	}

};
