var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

var jshintConfig = require('../.jshint.js');
jshintConfig.lookup = false; // don't let gulp-jshint search for .jshintrc files


gulp.task('lint', [
	'jscs:normal',
	'jscs:strict',
	'jshint:unbuilt',
	'jshint:built'
]);

gulp.task('jshint:unbuilt', function() {
	return gulp.src([
			'src/**/*.js',
			'!src/intro.js', // exclude
			'!src/outro.js', //
			'lang/*.js',
			'tests/automated/*.js',
			//'tasks/*.js', // TODO: complains about repeat defs of browser globals
			'build/*.js', // like karma config
			'*.js' // like gulpfile and root configs
		])
		.pipe(jshint(jshintConfig))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('jshint:built', [ 'modules', 'lang:all' ], function() {
	return gulp.src([
			'dist/*.js',
			'!dist/*.min.js',   // exclude
			'!dist/lang-all.js' //
		])
		.pipe(jshint(
			Object.assign({}, jshintConfig, {
				// Built modules are ready to be checked for...
				undef: true, // use of undeclared globals
				unused: 'vars' // functions/variables (excluding function arguments) that are never used
				//latedef: 'nofunc' // variables that are referenced before their `var` statement // TODO: revisit
			})
		))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('jscs:normal', function() {
	return gulp.src([
			'src/**/*.js',
			'!src/intro.js', // exclude
			'!src/outro.js', //
			'lang/*.js',
			'tasks/*.js',
			'build/*.js', // like karma config
			'*.js' // like gulpfile and root configs
		])
		.pipe(jscs({ 
			configPath: '.jscs.js'
		}))
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});

gulp.task('jscs:strict', function() {
	return gulp.src([
			'tests/automated/*.js'
		])
		.pipe(jscs({
			// more restrictions.
			// we eventually want these to apply to all other code too.
			configPath: '.jscs.strict.js'
		}))
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});
