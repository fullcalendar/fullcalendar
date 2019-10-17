const { parallel, src } = require('gulp')
const eslint = require('gulp-eslint')
const { shellTask } = require('./util')


exports.lint = parallel(
  shellTask('tslint --project .'),
  lintBuiltJs, // assumes already built!
  lintNodeJs,
  lintTests
)


/*
ONLY checks two things:
- code is ES5 compliant (for IE11)
- does not access any globals. this is important because the typescript compiler allows
  accessing globals that are defined in the project for tests (tests/automated/globals.d.ts)
*/
function lintBuiltJs() {
  return src([
    'package?(-premium)/*/dist/**/*.js',
    '!**/*.esm.js', // ESM has non-browser syntax. doing only the UMD is sufficient
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
}


function lintNodeJs() {
  return src([
    '*.js', // config files in root
    'scripts/**/*.js'
  ])
    .pipe(
      eslint({
        configFile: 'eslint.json',
        envs: [ 'node' ]
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}


/*
we would want to use tslint with jsRules:true, but doesn't work at all,
because of tslint-config-standard possibly
*/
function lintTests() {
  return src([
    'package?(-premium)/__tests__/**/*.js'
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
}
