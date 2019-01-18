const fs = require('fs')
const argv = require('yargs').argv

writeConfig()

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: [ 'jasmine' ],

    // list of files / patterns to load in the browser
    files: [

      // dependencies for main lib AND plugin
      'node_modules/superagent/superagent.js',
      'node_modules/moment/moment.js',
      'node_modules/moment/locale/es.js', // only spanish for testing
      'node_modules/moment-timezone/builds/moment-timezone-with-data.js',
      'node_modules/rrule/dist/es5/rrule.js',
      'node_modules/jquery/dist/jquery.js',

      'node_modules/components-jqueryui/jquery-ui.js',
      'node_modules/components-jqueryui/themes/cupertino/jquery-ui.css',
      { pattern: 'node_modules/components-jqueryui/themes/cupertino/images/**', included: false, nocache: true, watched: false  },

      // dependencies for tests
      'node_modules/native-promise-only/lib/npo.src.js', // Promises needed by xhr-mock
      'node_modules/xhr-mock/dist/xhr-mock.js', // TODO: should include this via require(), but .d.ts problems
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'node_modules/jquery-simulate/jquery.simulate.js',
      'node_modules/luxon/build/global/luxon.js', // TODO: how to deal with IE11?

      // core and plugin files
      'dist/fullcalendar/main.js', // needs to be first
      'dist/**/*.js',
      'dist/**/*.css',

      // sourcemaps
      { pattern: 'dist/**/*.map', included: false, nocache: true, watched: false },

      // src files referenced from sourcemaps
      { pattern: 'src/**/*', included: false, nocache: true, watched: false },

      // a way to dump variables into the test environment
      'tmp/automated-test-config.js',

      // so plugins can dump files into here and test side effects
      'tmp/test-side-effects/*.js',

      // tests
      'tests/automated/base.css',
      'tmp/automated-tests.js',
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
    isTravis: ('travis' in argv)
  }

  if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp')
  }
  fs.writeFileSync(
    'tmp/automated-test-config.js',
    'window.karmaConfig = ' + JSON.stringify(config),
    { encoding: 'utf8' }
  )
}
