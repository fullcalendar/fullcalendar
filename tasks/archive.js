var gulp = require('gulp');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var del = require('del');

var packageInfo = require('../package.json');
var PACKAGE_ID = packageInfo.name + '-' + packageInfo.version;

gulp.task('archive', [
	'archive:dist',
	'archive:lang',
	'archive:misc',
	'archive:deps',
	'archive:demos'
], function() {
	return gulp.src('tmp/' + PACKAGE_ID + '/**/*', { base: 'tmp/' })
		.pipe(zip(PACKAGE_ID + '.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('archive:clean', function() {
	return del([
		'tmp/' + PACKAGE_ID + '/',
		'dist/' + PACKAGE_ID + '.zip'
	]);
});

gulp.task('archive:dist', [ 'modules', 'minify' ], function() {
	return gulp.src('dist/*.{css,js}') // matches unminified and minified files
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/'));
});

gulp.task('archive:lang', [ 'lang' ], function() {
	return gulp.src([
			'dist/lang-all.js',
			'dist/lang/*.js'
		], {
			base: 'dist/'
		})
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/'));
});

gulp.task('archive:misc', function() {
	return gulp.src([
			'LICENSE.*',
			'CHANGELOG.*',
			'CONTRIBUTING.*'
		])
		.pipe(rename({ extname: '.txt' }))
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/'));
});

gulp.task('archive:deps', [ 'archive:jqui' ], function() {
	return gulp.src([
			'lib/moment/min/moment.min.js',
			'lib/jquery/dist/jquery.min.js'
		])
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/lib/'));
});

gulp.task('archive:jqui', [ 'archive:jqui:theme' ], function() {
	return gulp.src([
			'lib/jquery-ui/ui/minified/core.min.js',
			'lib/jquery-ui/ui/minified/widget.min.js',
			'lib/jquery-ui/ui/minified/mouse.min.js',
			'lib/jquery-ui/ui/minified/draggable.min.js'
		])
		.pipe(concat('jquery-ui.custom.min.js'))
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/lib/'));
});

gulp.task('archive:jqui:theme', function() {
	return gulp.src([
			'jquery-ui.min.css',
			'images/*'
		], {
			cwd: 'lib/jquery-ui/themes/cupertino/',
			base: 'lib/jquery-ui/themes/'
		})
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/lib/'));
});

gulp.task('archive:demos', function() {
	return gulp.src('**/*', { cwd: 'demos/', base: 'demos/' })
		.pipe(htmlFileFilter)
		.pipe(demoPathReplace)
		.pipe(htmlFileFilter.restore)
		.pipe(gulp.dest('tmp/' + PACKAGE_ID + '/demos/'));
});

var htmlFileFilter = filter('*.html', { restore: true }); // what?
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
