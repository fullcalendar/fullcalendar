var gulp = require('gulp');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var template = require('gulp-template');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var _ = require('lodash');

// project configs
var packageConf = require('../package.json');
var srcConf = require('../src.json');

// generates js/css files in dist directory
gulp.task('modules', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:' + distFile; // generates an array of task names
}));

// generates js/css/sourcemap files in dist directory
gulp.task('modules:dev', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:dev:' + distFile; // generates an array of task names
}));

// watches source files and generates js/css/sourcemaps
gulp.task('modules:watch', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:watch:' + distFile; // generates an array of task names
}));

// deletes all generated js/css files in the dist directory
gulp.task('modules:clean', function() {
	return del('dist/*.{js,css,map}');
});

// loop the distFile:srcFiles map
_.forEach(srcConf, function(srcFiles, distFile) {
	var isJs = /\.js$/.test(distFile);
	var separator = isJs ? '\n;;\n' : '\n\n'; // inserted between concated files

	gulp.task('modules:' + distFile, function() {
		return gulp.src(srcFiles, { cwd: 'src/', base: 'src/' })
			.pipe(plumber()) // affects future streams
			.pipe(concat(distFile, { newLine: separator }))
			.pipe(template(packageConf)) // replaces <%= %> variables
			.pipe(gulp.dest('dist/'));
	});

	gulp.task('modules:dev:' + distFile, function() {
		return gulp.src(srcFiles, { cwd: 'src/', base: 'src/' })
			.pipe(plumber()) // affects future streams
			.pipe(sourcemaps.init())
			.pipe(concat(distFile, { newLine: separator }))
			.pipe(template(packageConf)) // replaces <%= %> variables
			.pipe(sourcemaps.write('.', {
				includeContent: false, // because we'll reference the src files
				sourceRoot: '../src/' // relative to outputted file in dist
			}))
			.pipe(gulp.dest('dist/'));
	});

	// generates dev files first, then watches
	gulp.task('modules:watch:' + distFile, [ 'modules:dev:' + distFile ], function() {
		return gulp.watch(srcFiles, { cwd: 'src/' }, [ 'modules:dev:' + distFile ]);
	});
});
