var gulp = require('gulp');
var path = require('path');
var KarmaServer = require('karma').Server;

var karmaConf = path.join(__dirname, '../karma.conf.js'); // was getting confused with relative URLs

// runs a server, outputs a URL to visit.
// we want sourcemaps (webpack:dev).
gulp.task('test', [ 'webpack:dev' ], function() {
	new KarmaServer({
		configFile: karmaConf,
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});

// runs headlessly and continuously, watching files
gulp.task('test:headless', [ 'webpack' ], function() {
	new KarmaServer({
		configFile: karmaConf,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});

// runs headlessly once, then exits
gulp.task('test:single', [ 'webpack' ], function(done) {
	new KarmaServer({
		configFile: karmaConf,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: true,
		autoWatch: false
	}).on('run_complete', function(browsers, results) { // plays best with CI and other tasks
		done(results.exitCode);
	}).start();
});
