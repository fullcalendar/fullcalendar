const path = require('path')
const createConfig = require('./createConfig')

module.exports = function(settings) {
	return createConfig(settings, {
		tsconfig: path.resolve(__dirname, '../../plugins/tsconfig.json'),
		entry: {
			gcal: path.resolve(__dirname, '../../plugins/gcal/main.ts')
		},
		useExternalCore: true
	});
}
