var gulp = require('gulp');
var tslint = require('gulp-tslint');
var tsLintLib = require('tslint');
var eslint = require('gulp-eslint');

var tslintProgram = tsLintLib.Linter.createProgram("./tsconfig.json");
var eslintConfig = require('../eslint.json');

gulp.task('lint', [
	'lint:src',
	'lint:built',
	'lint:tasks',
	'lint:legacy',
	'ts-types' // make sure typescript defs compile without errors
]);

gulp.task('lint:src', function() {
	return gulp.src('src/**/*.ts')
		.pipe(
			tslint({ // will use tslint.json
				formatter: 'verbose',
				program: tslintProgram // for type-checking rules
			})
		)
		.pipe(tslint.report());
});

gulp.task('lint:built', [ 'modules', 'locale' ], function() {
	return gulp.src([
		'dist/*.js',
		'!dist/*.min.js'
	])
		.pipe(
			eslint({ // only checks that globals are properly accessed
				parserOptions: { 'ecmaVersion': 3 }, // for IE9
				envs: [ 'browser', 'commonjs', 'amd' ],
				rules: { 'no-undef': 2 }
			})
		)
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('lint:tasks', function() {
	return gulp.src('tasks/**/*.js')
		.pipe(
			eslint(Object.assign({}, eslintConfig, {
				// tailor main config for node
				envs: [ 'node' ]
			}))
		)
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('lint:legacy', function() {
	return gulp.src([
		'src/**/*.js',
		'!src/**/intro.js',
		'!src/**/outro.js',
		'!src/**/tslib-lite.js',
		'tests/**/*.js',
		'!tests/manual/**'
	])
		.pipe(
			eslint({ // lenient config from scratch
				extends: 'eslint:recommended',
				envs: [ 'browser' ],
				rules: {
					curly: 2
				}
			})
		)
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});
