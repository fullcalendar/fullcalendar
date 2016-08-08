var gulp = require('gulp');
var path = require('path');
var KarmaServer = require('karma').Server;

var KARMA_CONFIG_FILE = path.join(__dirname, '../build/karma.conf.js'); // was getting confused with relative URLs
// TODO: when moved, adjust linting as well

// Runs a server, outputs a URL to visit
gulp.task('test', [ 'modules', 'lang' ], function(done) {
	new KarmaServer({
		configFile: KARMA_CONFIG_FILE,
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});


// Runs headlessly and continuously, watching files
gulp.task('test:headless', [ 'modules', 'lang' ], function(done) {
	new KarmaServer({
		configFile: KARMA_CONFIG_FILE,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});


// Runs headlessly once, then exits
gulp.task('test:single', [ 'modules', 'lang' ], function(done) {
	new KarmaServer({
		configFile: KARMA_CONFIG_FILE,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: true,
		autoWatch: false
	}).on('run_complete', function(browsers, results) { // plays best with CI and other tasks
		done(results.exitCode);
	}).start();
});
