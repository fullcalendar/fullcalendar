
module.exports = function(config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: '',

		// frameworks to use
		frameworks: [ 'jasmine' ],

		// list of files / patterns to load in the browser
		files: [

			// For IE8 testing. Because doesn't have forEach and other ES5 methods
			// which are common in the tests.
			// You must run `bower install es5-shim` first.
			//'../lib/es5-shim/es5-shim.js',

			// For IE8 testing, we'll need jQuery 1.x. Before running karma, force the version:
			// `bower install jquery#1` and choose 1
			// to undo: `bower update jquery`

			'../lib/moment/moment.js',
			'../lib/jquery/dist/jquery.js',
			'../lib/jquery-ui/jquery-ui.js',

			// for jquery simulate
			'../lib/jquery-simulate-ext/libs/bililiteRange.js',
			'../lib/jquery-simulate-ext/libs/jquery.simulate.js',
			'../lib/jquery-simulate-ext/src/jquery.simulate.ext.js',
			'../lib/jquery-simulate-ext/src/jquery.simulate.drag-n-drop.js',
			'../lib/jquery-simulate-ext/src/jquery.simulate.key-sequence.js',
			'../lib/jquery-simulate-ext/src/jquery.simulate.key-combo.js',
			'../tests/lib/jquery-simulate-hacks.js', // needs to be last

			'../lib/jquery-mockjax/jquery.mockjax.js',
			'../lib/jasmine-jquery/lib/jasmine-jquery.js',
			'../lib/jasmine-fixture/dist/jasmine-fixture.js',
			'../tests/lib/jasmine-ext.js',
			'../tests/lib/dom-utils.js',
			'../tests/lib/dnd-resize-utils.js',

			'../dist/fullcalendar.js',
			'../dist/gcal.js',
			'../dist/lang-all.js',
			'../dist/fullcalendar.css',
			'../tests/base.css',

			// For IE8 testing. Because it can't handle running all the tests at once.
			// Comment out the *.js line and run karma with each of the lines below.
			//'../tests/automated/{a,b,c,d,e,f,g,h,i,j,k,l}*.js'
			//'../tests/automated/{m,n}*.js' // mostly moment tests
			//'../tests/automated/{o,p,q,r,s,t,u,v,w,x,y,z}*.js'

			'../tests/automated/*.js'
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
		captureTimeout: 60000
	});
};