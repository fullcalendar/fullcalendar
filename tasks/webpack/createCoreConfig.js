const path = require('path')
const createConfig = require('./createConfig')

module.exports = function(settings) {
	return createConfig(settings, {
		packageConf: require('../../package.json'),
		outputDir: path.resolve(__dirname, '../../dist'),
		context: path.resolve(__dirname, '../../src'),
		entry: {
			'fullcalendar': './main.ts',
			'fullcalendar.css': './main.scss',
			'fullcalendar.print.css': './common/print.scss'
		}
	})
}
