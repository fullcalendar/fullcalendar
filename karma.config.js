const { writeFileSync } = require('./scripts/lib/util')

writeConfig()

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: [ 'jasmine' ],

    // list of files / patterns to load in the browser
    // TODO: to test IE11, must comment-out luxon test
    files: [
      'packages/__tests__/src/base.css',

      // fullcalendar CSS must be manually included :(
      'packages/core/dist/main.css', // always needs to be first
      'packages/daygrid/dist/main.css', // because timegrid depends on it
      'packages-premium/timeline/dist/main.css', // because resource-timeline depends on it
      'packages?(-premium)/*/dist/main.css',
      { pattern: 'packages?(-premium)/*/dist/main.css.map', included: false, nocache: true, watched: false },

      // tests dependencies that are old or depend on order, so put them first
      'node_modules/jquery/dist/jquery.js', // because of jquery-simulate and needing-to-be-first
      'node_modules/jquery-simulate/jquery.simulate.js', // operates on global jQuery
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js', // weird this/root reference confuses rollup
      'node_modules/native-promise-only/lib/npo.src.js', // needed by xhr-mock for IE11
      'node_modules/xhr-mock/dist/xhr-mock.js', // esm requires node libs

      // hack for hoisting workaround. see rollup.config.js
      // TODO: afterwards, remove as many of these entries as possible from the root package.json
      'node_modules/luxon/build/global/luxon.js',
      'node_modules/rrule/dist/es5/rrule.js',
      'node_modules/moment/moment.js',
      'node_modules/moment/locale/es.js',
      'node_modules/moment-timezone/builds/moment-timezone-with-data.js',

      'tmp/test-config.js', // a way to dump variables into the test environment
      'tmp/tests.js',
      { pattern: 'tmp/tests.js.map', included: false, nocache: true, watched: false }
    ],

    // make console errors aware of source files
    preprocessors: {
      '**/*.js': ['sourcemap']
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

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    autoWatchBatchDelay: 1000, // try to fix karma crashing on imcomplete syntax

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

function writeConfig() {
  let config = {
    isCi: Boolean(process.env.CI)
  }

  writeFileSync(
    'tmp/test-config.js',
    'window.karmaConfig = ' + JSON.stringify(config)
  )
}
