const fs = require('fs');
const path = require('path');
const glob = require('glob');
const gulp = require('gulp');
const webpack = require('webpack-stream');
const KarmaServer = require('karma').Server;

const karmaConfigPath = path.join(__dirname, '../karma.config.js');
const webpackConfig = require('../webpack.tests.config');

// NOTE: top-level JS files in tests/ will be executed first
const TEST_GLOB = 'tests/*/*.{js,ts}';

// runs a server, outputs a URL to visit.
// expects dist to be compiled or watcher to be running.
gulp.task('test', [ 'test:async-watch' ], function() {
	new KarmaServer({
		configFile: karmaConfigPath,
		singleRun: false,
		autoWatch: true
	}, function(exitCode) { // plays best with developing from command line
		process.exit(exitCode);
	}).start();
});

// runs headlessly and continuously, watching files.
// expects dist to be compiled or watcher to be running.
gulp.task('test:headless', [ 'test:async-watch' ], function() {
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
gulp.task('test:single', [ 'webpack', 'test:sync-compile' ], function(done) {
	new KarmaServer({
		configFile: karmaConfigPath,
		browsers: [ 'PhantomJS_custom' ],
		singleRun: true,
		autoWatch: false
	}).on('run_complete', function(browsers, results) { // plays best with CI and other tasks
		done(results.exitCode);
	}).start();
});


// compilation

gulp.task('test:sync-compile', [ 'test:index' ], function() {
	return createStream();
});

gulp.task('test:async-watch', [ 'test:watch-index' ], function() {
	createStream(true); // not returning stream causes task to ignore termination
});

gulp.task('test:watch-index', [ 'test:index' ], function() {
	return gulp.watch(TEST_GLOB, [ 'test:index' ]);
});

gulp.task('test:index', function() {
	let out = '';

	glob.sync(TEST_GLOB).forEach(function(path) {
		out += "import '../" + path + "';\n";
	});

	if (!fs.existsSync('tmp')) {
		fs.mkdirSync('tmp');
	}
	fs.writeFileSync('tmp/test-index.js', out, { encoding: 'utf8' });
});

function createStream(enableWatch) {
	return gulp.src('tmp/test-index.js')
		.pipe(
			webpack(Object.assign({}, webpackConfig, {
				devtool: 'source-map',
				watch: enableWatch || false,
			}))
		)
		.pipe(gulp.dest('tmp/'));
}
