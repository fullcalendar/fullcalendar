var gulp = require('gulp');
var tslint = require('gulp-tslint');
var tsLintLib = require('tslint');
var eslint = require('gulp-eslint');

var tslintCoreProgram = tsLintLib.Linter.createProgram('./tsconfig.json');
var tslintPluginsProgram = tsLintLib.Linter.createProgram('./plugins/tsconfig.json');
var eslintConfig = require('../eslint.json');

gulp.task('lint', [
	'lint:core',
	'lint:plugins',
	'lint:built',
	'lint:tasks',
	'lint:legacy',
	'core-types' // make sure typescript defs compile without errors
]);

gulp.task('lint:core', function() {
	return gulp.src('src/**/*.ts')
		.pipe(
			tslint({ // will use tslint.json
				formatter: 'verbose',
				program: tslintCoreProgram // for type-checking rules
			})
		)
		.pipe(tslint.report());
});

gulp.task('lint:plugins', function() {
	return gulp.src('plugins/**/*.ts')
		.pipe(
			tslint({ // will use tslint.json
				formatter: 'verbose',
				program: tslintPluginsProgram // for type-checking rules
			})
		)
		.pipe(tslint.report());
});

gulp.task('lint:built', [ 'webpack' ], function() {
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
		'!src/tslib-lite.js',
		'!src/**/intro.js',
		'!src/**/outro.js',
		'tests/**/*.js',
		'!tests/manual/**'
	])
		.pipe(
			eslint({ // lenient config from scratch
				extends: 'eslint:recommended',
				envs: [ 'browser' ],
				rules: { curly: 2 }
			})
		)
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});
