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

      // dependencies for main lib
      'node_modules/moment/moment.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/components-jqueryui/jquery-ui.js',
      'node_modules/components-jqueryui/themes/cupertino/jquery-ui.css',

      // main lib files
      'dist/fullcalendar.js',
      'dist/fullcalendar.css',
      'dist/gcal.js',
      'dist/locale-all.js',

      // a way to dump variables into the test environment
      'tmp/automated-test-config.js',

      // so plugins can dump files into here and test side effects
      'tmp/test-side-effects/*.js',

      // dependencies for tests
      'node_modules/native-promise-only/lib/npo.src.js',
      'node_modules/jquery-mockjax/dist/jquery.mockjax.js',
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'node_modules/jasmine-fixture/dist/jasmine-fixture.js',
      'node_modules/jquery-simulate/jquery.simulate.js',

      'tests/automated/base.css',
      'tmp/automated-tests.js',

      { // serve all other files
        pattern: '**/*',
        included: false, // don't immediately execute
        nocache: true, // don't let the webserver cache
        watched: false // don't let changes trigger tests to restart
      }
    ],

    preprocessors: {
      '**/*.js': [ 'sourcemap' ]
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

    // force a window size for PhantomJS, because it's usually unreasonably small, resulting in offset problems
    customLaunchers: {
      PhantomJS_custom: {
        base: 'PhantomJS',
        options: {
          viewportSize: {
            width: 1024,
            height: 768
          }
        }
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
