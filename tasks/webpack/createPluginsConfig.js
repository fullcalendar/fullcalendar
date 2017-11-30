const path = require('path')
const createConfig = require('./createConfig')

module.exports = function(settings) {
	return createConfig(settings, {
		packageConf: require('../../package.json'),
		outputDir: path.resolve(__dirname, '../../dist'),
		tsconfig: path.resolve(__dirname, '../../plugins/tsconfig.json'),
		context: path.resolve(__dirname, '../../plugins'),
		useExternalCore: true,
		entry: {
			gcal: './gcal/main.ts'
		}
	});
}
