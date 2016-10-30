var gulp = require('gulp');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var replace = require('gulp-replace');
var zip = require('gulp-zip');
var del = require('del');

// determines the name of the ZIP file
var packageConf = require('../package.json');
var packageId = packageConf.name + '-' + packageConf.version;

gulp.task('archive', [
	'archive:dist',
	'archive:locale',
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

gulp.task('archive:locale', [ 'locale' ], function() {
	return gulp.src([
		'dist/locale-all.js',
		'dist/locale/*.js'
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

gulp.task('archive:deps', [ 'archive:jqui:theme' ], function() {
	return gulp.src([
		'node_modules/moment/min/moment.min.js',
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/components-jqueryui/jquery-ui.min.js'
	])
	.pipe(gulp.dest('tmp/' + packageId + '/lib/'));
});

// transfers a single jQuery UI theme
gulp.task('archive:jqui:theme', function() {
	return gulp.src([
		'jquery-ui.min.css',
		'images/*'
	], {
		cwd: 'node_modules/components-jqueryui/themes/cupertino/',
		base: 'node_modules/components-jqueryui/themes/'
	})
	.pipe(gulp.dest('tmp/' + packageId + '/lib/'));
});

// transfers demo files, transforming their paths to dependencies
gulp.task('archive:demos', function() {
	return gulp.src('**/*', { cwd: 'demos/', base: 'demos/' })
		.pipe(htmlFileFilter)
		.pipe(demoPathReplace)
		.pipe(htmlFileFilter.restore) // pipe thru files that didn't match htmlFileFilter
		.pipe(gulp.dest('tmp/' + packageId + '/demos/'));
});

var htmlFileFilter = filter('*.html', { restore: true });
var demoPathReplace = replace(
	/((?:src|href)=['"])([^'"]*)(['"])/g,
	function(m0, m1, m2, m3) {
		return m1 + transformDemoPath(m2) + m3;
	}
);

function transformDemoPath(path) {
	// reroot 3rd party libs
	path = path.replace('../node_modules/moment/', '../lib/');
	path = path.replace('../node_modules/jquery/dist/', '../lib/');
	path = path.replace('../node_modules/components-jqueryui/themes/cupertino/', '../lib/cupertino/'); // must be first
	path = path.replace('../node_modules/components-jqueryui/', '../lib/');

	// reroot dist files to archive root
	path = path.replace('../dist/', '../');

	if (
		!/\.min\.(js|css)$/.test(path) && // not already minified
		path !== '../locale-all.js' // this file is already minified
	) {
		// use minified
		path = path.replace(/\/([^\/]*)\.(js|css)$/, '/$1.min.$2');
	}

	return path;
}
