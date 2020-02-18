const { writeFileSync } = require('./scripts/lib/util')

let cmdArgs = process.argv.slice(2)
let isRealCiEnv = Boolean(process.env.CI)
let isCi = isRealCiEnv || cmdArgs.indexOf('ci') !== -1

writeFileSync(
  'tmp/tests-compiled/config.js',
  'window.karmaConfig = ' + JSON.stringify({
    isCi: Boolean(process.env.CI)
  })
)

module.exports = function(config) {
  config.set({
    singleRun: isCi,
    autoWatch: !isCi,
    browsers: isCi ? [ 'ChromeHeadless_custom' ] : [],

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: [ 'jasmine' ],

    // list of files / patterns to load in the browser
    files: [

      // jquery-related deps should attach globally first
      'node_modules/jquery/dist/jquery.js', // because of jquery-simulate and needing-to-be-first
      'node_modules/jquery-simulate/jquery.simulate.js', // operates on global jQuery
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js', // weird this/root reference confuses rollup

      'tmp/tests-compiled/config.js', // a way to dump variables into the test environment
      'tmp/tests-compiled/main.js',
      { pattern: 'tmp/tests-compiled/main.css', watched: false  }, // let the JS cause the refresh
      { pattern: 'tmp/tests-compiled/*.map', included: false, nocache: true, watched: false }
    ],

    // make console errors aware of source files
    preprocessors: {
      'tmp/tests-compiled/*.+(js|css)': [ 'sourcemap' ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage', 'verbose'
    reporters: [ 'dots' ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    customLaunchers: {
      ChromeHeadless_custom: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox', // needed for TravisCI: https://docs.travis-ci.com/user/chrome#Sandboxing
          '--window-size=1280,1696' // some tests only work with larger window (w?, h?)
        ]
      }
    }
  })
}
