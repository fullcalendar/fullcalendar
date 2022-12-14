import { createRequire } from 'module'
import karma from 'karma'

const require = createRequire(import.meta.url)

export default function(filePaths, isDev, cliArgs) {
  const filePathsWithSrcMaps = filePaths
    .filter((filePath) => (
      // TODO: must proper built dist files (HACK)
      filePath.match(/[\\/]dist[\\/]/)
    ))

  const files = [
    require.resolve('jquery'),
    require.resolve('jasmine-jquery'),
    require.resolve('jquery-simulate'),
    require.resolve('components-jqueryui'),
    ...filePaths,
    ...filePathsWithSrcMaps
      .map((path) => ({
        pattern: path.replace(/\.js$/, '.js.map'),
        included: false,
      })),
  ]

  const preprocessors = filePathsWithSrcMaps.reduce((props, distFile) => (
    Object.assign(props, { [distFile]: ['sourcemap'] })
  ), {})

  return {
    singleRun: !isDev,
    autoWatch: isDev,
    browsers: !isDev ? ['ChromeHeadless_custom'] : [],
    client: { cliArgs }, // access via `window.__karma__.config.cliArgs`

    files,
    preprocessors,

    plugins: [
      require('karma-chrome-launcher'),
      require('karma-jasmine'),
      require('karma-sourcemap-loader'),
      require('karma-verbose-reporter'),
    ],

    // frameworks to use
    frameworks: ['jasmine'],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage', 'verbose'
    reporters: ['dots'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: karma.constants.LOG_INFO,

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    customLaunchers: {
      ChromeHeadless_custom: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox', // needed for TravisCI: https://docs.travis-ci.com/user/chrome#Sandboxing
          '--window-size=1280,1696', // some tests only work with larger window (w?, h?)
        ],
      },
    },
  }
}
