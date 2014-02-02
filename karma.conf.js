
module.exports = function(config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: '',

		// frameworks to use
		frameworks: [ 'jasmine' ],

		// list of files / patterns to load in the browser
		files: [
			{ pattern: 'lib/moment/moment.js', watched: false },
			{ pattern: 'lib/jquery/jquery.js', watched: false },
			{ pattern: 'lib/jquery-ui/ui/jquery-ui.js', watched: false },
			{ pattern: 'lib/jquery-simulate/jquery.simulate.js', watched: false },
			{ pattern: 'lib/jasmine-jquery/lib/jasmine-jquery.js', watched: false },
			{ pattern: 'lib/jasmine-fixture/dist/jasmine-fixture.js', watched: false },
			'tests/lib/jasmine-ext.js',
			'build/out/fullcalendar.js',
			'build/out/fullcalendar.css',
			'tests/base.css',
			'tests/automated/*.js'
		],

		// list of files to exclude
		exclude: [],

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: [ 'dots' ],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		//browsers: [ 'PhantomJS' ],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false
	});
};