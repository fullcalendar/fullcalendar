const gulp = require('gulp')
const gutil = require('gulp-util')
const eslint = require('gulp-eslint')
const tslint = require('gulp-tslint')
const tsLintLib = require('tslint')
const ts = require('typescript')

const tslintProgram = tsLintLib.Linter.createProgram('./tsconfig.json')

gulp.task('lint', [
  'lint:ts',
  'lint:dts',
  'lint:js:built',
  'lint:js:node',
  'lint:js:tests'
])

gulp.task('lint:ts', function() {
  return gulp.src([
    'src/**/*.ts',
    'plugins/**/*.ts'
  ])
    .pipe(
      tslint({ // will use tslint.json
        formatter: 'verbose',
        program: tslintProgram // for type-checking rules
      })
    )
    .pipe(tslint.report())
})

// lints the TypeScript definitions file
// from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
gulp.task('lint:dts', [ 'ts-types' ], function(done) {
  let program = ts.createProgram([ 'dist/fullcalendar.d.ts' ], {
    noEmitOnError: true,
    noImplicitAny: true // makes sure all types are defined. the whole point!
  })
  let emitResult = program.emit()
  if (emitResult.emitSkipped) { // error?
    emitResult.diagnostics.forEach(function(diagnostic) {
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        gutil.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
      } else {
        gutil.log(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`)
      }
    })
    done('There are .d.ts linting problems.')
  } else {
    done() // success
  }
})

gulp.task('lint:js:built', [ 'webpack' ], function() {
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

gulp.task('lint:js:node', function() {
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

gulp.task('lint:js:tests', function() {
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
          'karmaConfig',
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
