var del = require('del');
var _ = require('lodash');
var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var template = require('gulp-template');
var sourcemaps = require('gulp-sourcemaps');

var packageConf = require('../package.json');
var srcConf = require('../src.json');

gulp.task('modules', _.map(srcConf, function(srcFiles, distFile) { // TODO: clean a prerequ???
	return 'modules:' + distFile;
}));

gulp.task('modules:dev', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:dev:' + distFile;
}));

gulp.task('modules:watch', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:watch:' + distFile;
}));

gulp.task('modules:clean', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:clean:' + distFile;
}));

_.forEach(srcConf, function(srcFiles, distFile) {
	var isJs = /\.js$/.test(distFile);
	var separator = isJs ? ';;\n\n' : '\n\n';

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
				includeContent: false,
				sourceRoot: '../src/' // relative to outputted file in dist
			}))
			.pipe(gulp.dest('dist/'));
	});

	gulp.task('modules:watch:' + distFile, [ 'modules:dev:' + distFile ], function() {
		return gulp.watch(srcFiles, { cwd: 'src/' }, [ 'modules:dev:' + distFile ]);
	});

	gulp.task('modules:clean:' + distFile, function() {
		return del([
			'dist/' + distFile,
			'dist/' + distFile + '.map'
		]);
	});
});
