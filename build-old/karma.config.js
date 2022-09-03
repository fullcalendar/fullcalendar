const { writeFileSync } = require('./scripts/lib/util')

let cmdArgs = process.argv.slice(2)
let isRealCiEnv = Boolean(process.env.CI)
let isCi = isRealCiEnv || cmdArgs.indexOf('ci') !== -1

writeFileSync(
  'tmp/tests/config.js',
  'window.karmaConfig = ' + JSON.stringify({
    isCi: isRealCiEnv
  })
)

module.exports = function(config) {
  config.set({
    singleRun: isCi,
    autoWatch: !isCi,
    browsers: isCi ? [ 'ChromeHeadless_custom' ] : [],

    // base path, that will be used to resolve files and exclude
    basePath: '',

    plugins: [
      require('karma-chrome-launcher'),
      require('karma-jasmine'),
      require('karma-sourcemap-loader'),
      require('karma-verbose-reporter')
    ],

    // frameworks to use
    frameworks: [ 'jasmine' ],

    // list of files / patterns to load in the browser
    files: [
      'tmp/tests/config.js',
      'tmp/tests/all.js',
      { pattern: 'tmp/tests/all.js.map', included: false }
    ],

    // make console errors aware of source files
    preprocessors: {
      'tmp/tests/*.js': [ 'sourcemap' ]
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


// ...getJsFilesFromHtml('tmp/tests/all.html').map((shortPath) => (
//   'tmp/tests/' + shortPath
// ))

// function getJsFilesFromHtml(htmlPath) {
//   let html = readFileSync(htmlPath)
//   let matches = [ ...html.matchAll(/src=['"]([^'"]*)['"]/g) ] // iterator->array

//   return matches.map((match) => match[1])
// }
