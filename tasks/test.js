const fs = require('fs');
const path = require('path');
const glob = require('glob');
const gulp = require('gulp');
const webpack = require('webpack-stream');
const KarmaServer = require('karma').Server;

const karmaConfigPath = path.join(__dirname, '../karma.config.js');
const webpackConfig = require('../webpack.tests.config');

const TESTS_GLOB = 'tests/*/*.{js,ts}'; // top-level JS files in tests/ will be executed first
const TESTS_OUT_DIR = webpackConfig.output.path;
const TESTS_INDEX_PATH = TESTS_OUT_DIR + '/tests-index.js';
const TESTS_COMPILED_PATH = TESTS_OUT_DIR + '/' + webpackConfig.output.filename;


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
	clearCompileTests();
	createStream(true); // not returning stream causes task to ignore termination
});

gulp.task('test:watch-index', [ 'test:index' ], function() {
	return gulp.watch(TESTS_GLOB, [ 'test:index' ]);
});

gulp.task('test:index', function() {
	let out = '';

	glob.sync(TESTS_GLOB).forEach(function(path) {
		out += "import '../" + path + "';\n";
	});

	ensureOutDir();
	fs.writeFileSync(TESTS_INDEX_PATH, out, { encoding: 'utf8' });
});


function createStream(enableWatch) {
	return gulp.src(TESTS_INDEX_PATH)
		.pipe(
			webpack(Object.assign({}, webpackConfig, {
				devtool: 'source-map',
				watch: enableWatch || false,
			}))
		)
		.pipe(gulp.dest(TESTS_OUT_DIR));
}

function ensureOutDir() {
	if (!fs.existsSync(TESTS_OUT_DIR)) {
		fs.mkdirSync(TESTS_OUT_DIR);
	}
}

function clearCompileTests() {
	if (fs.existsSync(TESTS_COMPILED_PATH)) {
		fs.unlinkSync(TESTS_COMPILED_PATH);
	}
}
