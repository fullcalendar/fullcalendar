var gulp = require('gulp');
var tslint = require('gulp-tslint');
var tsLintLib = require('tslint');
var eslint = require('gulp-eslint');

var tslintCoreProgram = tsLintLib.Linter.createProgram('./tsconfig.json');
var tslintPluginsProgram = tsLintLib.Linter.createProgram('./plugins/tsconfig.json');
var eslintConfig = require('../eslint.json');

gulp.task('lint', [
  'ts-types' // make sure typescript defs compile without errors
]);

// TODO: don't forget plugins
