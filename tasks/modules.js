const del = require('del');
const _ = require('lodash'); // TODO: kill
const gulp = require('gulp');
const plumber = require('gulp-plumber'); // TODO: kill
const concat = require('gulp-concat'); // TODO: kill
const template = require('gulp-template'); // TODO: kill
const sourcemaps = require('gulp-sourcemaps'); // TODO: kill
const webpack = require('webpack-stream');

// configs
const packageConf = require('../package.json'); // TODO: kill
const srcConf = require('../src.json'); // TODO: kill
const createCoreConfig = require('./webpack/createCoreConfig');
const createPluginsConfig = require('./webpack/createPluginsConfig');


gulp.task('modules', [ 'core', 'plugins', 'css' ]);
gulp.task('modules:dev', [ 'core:dev', 'plugins:dev', 'css:dev' ]);
gulp.task('modules:watch', [ 'core:watch', 'plugins:watch', 'css:watch' ]);

// deletes all generated js/css files in the dist directory
gulp.task('modules:clean', function() {
	return del('dist/*.{js,ts,css,map}');
});

// core

gulp.task('core', function() {
	const config = createCoreConfig();
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('core:dev', function() {
	const config = createCoreConfig({ debug: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('core:watch', function() {
	const config = createCoreConfig({ debug: true, watch: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

// plugins

gulp.task('plugins', [ 'ts-types' ], function() {
	const config = createPluginsConfig();
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('plugins:dev', [ 'ts-types' ], function() {
	const config = createPluginsConfig({ debug: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

gulp.task('plugins:watch', [ 'ts-types' ], function() {
	const config = createPluginsConfig({ debug: true, watch: true });
	return gulp.src([])
		.pipe(webpack(config))
		.pipe(gulp.dest(config.output.path));
});

// css (TODO: kill)

// generates js/css/sourcemap files in dist directory
gulp.task('css', _.map(srcConf, function(srcFiles, distFile) {
	return 'css:' + distFile; // generates an array of task names
}));

// generates js/css/sourcemap files in dist directory
gulp.task('css:dev', _.map(srcConf, function(srcFiles, distFile) {
	return 'css:dev:' + distFile; // generates an array of task names
}));

// watches source files and generates js/css/sourcemaps
gulp.task('css:watch', _.map(srcConf, function(srcFiles, distFile) {
	return 'css:watch:' + distFile; // generates an array of task names
}));

// loop the distFile:srcFiles map
_.forEach(srcConf, function(srcFiles, distFile) {

	gulp.task('css:' + distFile, function() {
		return gulp.src(srcFiles, { cwd: 'src/', base: 'src/' })
			.pipe(plumber()) // affects future streams
			.pipe(concat(distFile, { newLine: '\n\n' }))
			.pipe(template(packageConf)) // replaces <%= %> variables
			.pipe(gulp.dest('dist/'));
	});

	gulp.task('css:dev:' + distFile, function() {
		return gulp.src(srcFiles, { cwd: 'src/', base: 'src/' })
			.pipe(plumber()) // affects future streams
			.pipe(sourcemaps.init())
			.pipe(concat(distFile, { newLine: '\n\n' }))
			.pipe(template(packageConf)) // replaces <%= %> variables
			.pipe(sourcemaps.write('.', {
				includeContent: false, // because we'll reference the src files
				sourceRoot: '../src/' // relative to outputted file in dist
			}))
			.pipe(gulp.dest('dist/'));
	});

	// generates dev files first, then watches
	gulp.task('css:watch:' + distFile, [ 'css:dev:' + distFile ], function() {
		return gulp.watch(srcFiles, { cwd: 'src/' }, [ 'css:dev:' + distFile ]);
	});
});
