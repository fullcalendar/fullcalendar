const gulp = require('gulp')
const eslint = require('gulp-eslint')
const shell = require('gulp-shell')

gulp.task('lint', [
  'lint:ts',
  'lint:js:built',
  'lint:js:node',
  'lint:js:tests'
])

gulp.task('lint:ts', shell.task('tslint --project .'))

/*
ONLY checks two things:
- code is ES5 compliant (for IE11)
- does not access any globals. this is important because the typescript compiler allows
  accessing globals that are defined in the project for tests (tests/automated/globals.d.ts)
*/
gulp.task('lint:js:built', [ 'build' ], function() {
  return gulp.src([
    'dist/**/*.js',
    '!**/*.min.js'
  ])
    .pipe(
      eslint({
        parserOptions: { 'ecmaVersion': 5 },
        envs: [ 'browser', 'commonjs', 'amd' ],
        rules: { 'no-undef': 2 }
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('lint:js:node', function() {
  return gulp.src([
    '*.js', // config files in root
    'bin/*.js',
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

/*
we would want to use tslint with jsRules:true, but doesn't work at all,
because of tslint-config-standard possibly
*/
gulp.task('lint:js:tests', function() {
  return gulp.src([
    'tests/automated/**/*.js'
  ])
    .pipe(
      eslint({
        configFile: 'eslint.json',
        envs: [ 'browser' ],
        rules: { 'no-undef': 0 } // ignore referencing globals. tsc already checks this
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})
