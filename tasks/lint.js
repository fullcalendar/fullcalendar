const gulp = require('gulp')
const tslint = require('gulp-tslint')
const tsLintLib = require('tslint')
const eslint = require('gulp-eslint')

const tslintProgram = tsLintLib.Linter.createProgram('./tsconfig.json')

gulp.task('lint', [
  'lint:src',
  'lint:built',
  'lint:node',
  'lint:tests',
  'ts-types' // make sure typescript defs compile without errors
])

gulp.task('lint:src', function() {
  return gulp.src('src/**/*.ts')
    .pipe(
      tslint({ // will use tslint.json
        formatter: 'verbose',
        program: tslintProgram // for type-checking rules
      })
    )
    .pipe(tslint.report())
})

gulp.task('lint:built', [ 'webpack:dev' ], function() {
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
    .pipe(eslint.failAfterError())
})

gulp.task('lint:node', function() {
  return gulp.src([
    '*.js', // config files in root
    'tasks/**/*.js'
  ])
    .pipe(
      eslint({
        configFile: 'eslint.json',
        envs: [ 'node' ]
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('lint:tests', function() {
  return gulp.src([
    'tests/**/*.js',
    '!tests/manual/themeswitcher/**'
  ])
    .pipe(
      eslint({
        configFile: 'eslint.json',
        envs: [ 'browser', 'jasmine', 'jquery' ],
        globals: [
          'moment',
          'pushOptions',
          'describeOptions',
          'describeTimezones',
          'describeValues',
          'pit',
          'affix',
          'getCurrentOptions',
          'initCalendar',
          'currentCalendar',
          'spyOnMethod',
          'spyOnCalendarCallback',
          'spyCall',
          'oneCall'
        ]
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})
