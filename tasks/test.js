const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack-stream');
const KarmaServer = require('karma').Server;

const karmaConfigPath = path.join(__dirname, '../karma.conf.js');
const webpackConfig = require('../webpack.tests.config')

// runs a server, outputs a URL to visit.
// we want sourcemaps (webpack:dev).
gulp.task('test', [ 'webpack:dev' ], function() {
	createStream(true, true); // don't block
	new KarmaServer({
		configFile: karmaConfigPath,
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});

// runs headlessly and continuously, watching files
gulp.task('test:headless', [ 'webpack' ], function() {
	createStream(true, true); // don't block
	new KarmaServer({
		configFile: karmaConfigPath,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});

// runs headlessly once, then exits
gulp.task('test:single', [ 'webpack', 'test:compile' ], function(done) {
	new KarmaServer({
		configFile: karmaConfigPath,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: true,
		autoWatch: false
	}).on('run_complete', function(browsers, results) { // plays best with CI and other tasks
		done(results.exitCode);
	}).start();
});

gulp.task('test:compile', function(done) {
	return createStream(true);
});

function createStream(enableSourceMaps, enableWatch) {
	return gulp.src([]) // don't pass in any files. webpack handles that
		.pipe(
			webpack(Object.assign({}, webpackConfig, {
				devtool: enableSourceMaps ? 'source-map' : false, // also 'inline-source-map'
				watch: enableWatch || false,
			}))
		)
		.pipe(gulp.dest(webpackConfig.output.path))
}
