const path = require('path')
const createConfig = require('./createConfig')

module.exports = function(settings) {
	return createConfig(settings, {
		entry: {
			fullcalendar: path.resolve(__dirname, '../../src/main.ts')
		}
	})
}
