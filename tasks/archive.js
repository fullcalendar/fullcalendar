var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var replace = require('gulp-replace');
var zip = require('gulp-zip');
var del = require('del');

// determines the name of the ZIP file
var packageConf = require('../package.json');
var packageId = packageConf.name + '-' + packageConf.version;

gulp.task('archive', [
	'archive:dist',
	'archive:lang',
	'archive:misc',
	'archive:deps',
	'archive:demos'
], function() {
	// make the zip, with a single root directory of a similar name
	return gulp.src('tmp/' + packageId + '/**/*', { base: 'tmp/' })
		.pipe(zip(packageId + '.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('archive:clean', function() {
	return del([
		'tmp/' + packageId + '/',
		'dist/' + packageId + '.zip'
	]);
});

gulp.task('archive:dist', [ 'modules', 'minify' ], function() {
	return gulp.src('dist/*.{js,css}') // matches unminified and minified files
		.pipe(gulp.dest('tmp/' + packageId + '/'));
});

gulp.task('archive:lang', [ 'lang' ], function() {
	return gulp.src([
			'dist/lang-all.js',
			'dist/lang/*.js'
		], {
			base: 'dist/'
		})
		.pipe(gulp.dest('tmp/' + packageId + '/'));
});

gulp.task('archive:misc', function() {
	return gulp.src([
			'LICENSE.*',
			'CHANGELOG.*',
			'CONTRIBUTING.*'
		])
		.pipe(rename({ extname: '.txt' }))
		.pipe(gulp.dest('tmp/' + packageId + '/'));
});

gulp.task('archive:deps', [ 'archive:jqui' ], function() {
	return gulp.src([
			'lib/moment/min/moment.min.js',
			'lib/jquery/dist/jquery.min.js'
		])
		.pipe(gulp.dest('tmp/' + packageId + '/lib/'));
});

// makes a custom build of jQuery UI
gulp.task('archive:jqui', [ 'archive:jqui:theme' ], function() {
	return gulp.src([
			'lib/jquery-ui/ui/minified/core.min.js',
			'lib/jquery-ui/ui/minified/widget.min.js',
			'lib/jquery-ui/ui/minified/mouse.min.js',
			'lib/jquery-ui/ui/minified/draggable.min.js'
		])
		.pipe(concat('jquery-ui.custom.min.js'))
		.pipe(gulp.dest('tmp/' + packageId + '/lib/'));
});

// transfers a single jQuery UI theme
gulp.task('archive:jqui:theme', function() {
	return gulp.src([
			'jquery-ui.min.css',
			'images/*'
		], {
			cwd: 'lib/jquery-ui/themes/cupertino/',
			base: 'lib/jquery-ui/themes/'
		})
		.pipe(gulp.dest('tmp/' + packageId + '/lib/'));
});

// transfers demo files, transforming their paths to dependencies
gulp.task('archive:demos', function() {
	return gulp.src('**/*', { cwd: 'demos/', base: 'demos/' })
		.pipe(htmlFileFilter)
		.pipe(demoPathReplace)
		.pipe(gulp.dest('tmp/' + packageId + '/demos/'));
});

var htmlFileFilter = filter('*.html');
var demoPathReplace = replace(
	/((?:src|href)=['"])([^'"]*)(['"])/g,
	function(m0, m1, m2, m3) {
		return m1 + transformDemoPath(m2) + m3;
	}
);

function transformDemoPath(path) {
	path = path.replace('../lib/moment/moment.js', '../lib/moment.min.js');
	path = path.replace('../lib/jquery/dist/jquery.js', '../lib/jquery.min.js');
	path = path.replace('../lib/jquery-ui/jquery-ui.js', '../lib/jquery-ui.custom.min.js');
	path = path.replace('../lib/jquery-ui/themes/cupertino/', '../lib/cupertino/');
	path = path.replace('../dist/', '../');
	path = path.replace('/fullcalendar.js', '/fullcalendar.min.js');
	return path;
}
