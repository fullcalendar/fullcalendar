const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('./package.json')

/*
NOTE: js and typescript module names shouldn't have a .js extention,
however, all other types of modules should.
*/
const MODULES = {
  'dist/fullcalendar/main': './src/core/main.ts',
  'dist/fullcalendar/main.css': './src/core/main.scss',
  'dist/fullcalendar-agenda/main': './src/agenda/main.ts',
  'dist/fullcalendar-agenda/main.css': './src/agenda/main.scss',
  'dist/fullcalendar-list/main': './src/list/main.ts',
  'dist/fullcalendar-list/main.css': './src/list/main.scss',
  'dist/fullcalendar-gcal/main': './src/gcal/main.ts',
  'dist/fullcalendar-moment/main': './src/moment/main.ts',
  'dist/fullcalendar-moment-timezone/main': './src/moment-timezone/main.ts',
  'dist/fullcalendar-luxon/main': './src/luxon/main.ts',
  'dist/fullcalendar-rrule/main': './src/rrule/main.ts',
  'tmp/automated-tests': './tests/automated/index'
}

const BANNER =
  '<%= title %> v<%= version %>\n' +
  'Docs & License: <%= homepage %>\n' +
  '(c) <%= copyright %>'

module.exports = {

  entry: Object.assign({}, MODULES, generateLocaleMap()),

  externals: {
    superagent: 'superagent',
    moment: 'moment',
    'moment-timezone': 'moment-timezone',
    luxon: 'luxon',
    rrule: 'rrule',
    dragula: 'dragula',

    // for plugins that might need jQuery
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery'
    },

    // plugins reference the root 'fullcalendar' namespace
    fullcalendar: {
      commonjs: 'fullcalendar',
      commonjs2: 'fullcalendar',
      amd: 'fullcalendar',
      root: 'FullCalendar'
    }
  },

  resolve: {
    extensions: [ '.ts', '.js' ],
    alias: {
      // use our slimmed down version
      // still need to npm-install the original though, for typescript transpiler
      tslib: path.resolve(__dirname, 'src/tslib-lite.js')
    }
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true // so ForkTsCheckerWebpackPlugin can take over
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract([ 'css-loader' ])
      },
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract([ 'css-loader', 'sass-loader' ])
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new ExtractTextPlugin({
      filename: '[name]', // the module name should already have .css in it!
      allChunks: true
    }),
    new webpack.BannerPlugin(BANNER)
  ],

  watchOptions: {
    aggregateTimeout: 100,
    ignored: /node_modules/
  },

  output: {
    library: 'FullCalendar', // gulp will strip this out for plugins
    libraryTarget: 'umd',
    filename: '[name].js',
    path: __dirname,
    devtoolModuleFilenameTemplate: 'webpack:///' + packageConfig.name + '/[resource-path]'
  }

}

/*
TODO: try https://webpack.js.org/plugins/module-concatenation-plugin/
*/
function generateLocaleMap() {
  const map = {}

  glob.sync('locales/*.js').forEach(function(path) {
    // strip out .js to get module name. also, path must start with ./
    map['dist/fullcalendar/' + path.replace(/\.js$/, '')] = './' + path
  })

  map['dist/fullcalendar/locales-all'] = Object.values(map) // all locales combined

  return map
}
