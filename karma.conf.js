
module.exports = function(config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: '',

		// frameworks to use
		frameworks: [ 'jasmine' ],

		// list of files / patterns to load in the browser
		files: [
			'node_modules/native-promise-only/lib/npo.src.js',
			'node_modules/moment/moment.js',
			'node_modules/jquery/dist/jquery.js',
			'node_modules/components-jqueryui/jquery-ui.js',
			'node_modules/components-jqueryui/themes/cupertino/jquery-ui.css',

			'node_modules/jquery-simulate/jquery.simulate.js',
			'node_modules/jquery-mockjax/dist/jquery.mockjax.js',
			'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
			'node_modules/jasmine-fixture/dist/jasmine-fixture.js',

			'tests/lib/jasmine-ext.js',
			'tests/lib/simulate.js',
			'tests/lib/dom-utils.js',
			'tests/lib/dnd-resize-utils.js',
			'tests/lib/time-grid.js',
			'tests/base.css',

			'dist/fullcalendar.js',
			'dist/gcal.js',
			'dist/locale-all.js',
			'dist/fullcalendar.css',

			// For testing if scheduler's JS, even when not actived, screws anything up
			//'../fullcalendar-scheduler/dist/scheduler.js',
			//'../fullcalendar-scheduler/dist/scheduler.css',

			// we want everything in these directories to be served, but not included as script tags:
			//   dist - for sourcemap files
			//   src - for source files the sourcemap references
			//   node_modules - 3rd party lib dependencies, like jquery-ui theme images
			// (don't let the webserver cache the results)
			{ pattern: '{dist,src,node_modules}/**/*', included: false, watched: false, nocache: true },

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

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,

		// force a window size for PhantomJS, because it's usually unreasonably small, resulting in offset problems
		customLaunchers: {
			PhantomJS_custom: {
				base: 'PhantomJS',
				options: {
					viewportSize: {
						width: 1024,
						height: 768
					}
				}
			}
		}
	});
};