const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const { CheckerPlugin } = require('awesome-typescript-loader') // for https://github.com/webpack/webpack/issues/3460
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('./package.json')

/*
NOTE: js and typescript module names shouldn't have a .js extention,
however, all other types of modules should.
*/
const MODULES = {
  'dist/fullcalendar': './src/main.ts',
  'dist/fullcalendar.css': './src/main.scss',
  'dist/fullcalendar.print.css': './src/common/print.scss',
  'dist/gcal': './plugins/gcal/main.ts',
  'tmp/automated-tests': './tests/automated/index'
}

const BANNER =
  '<%= title %> v<%= version %>\n' +
  'Docs & License: <%= homepage %>\n' +
  '(c) <%= copyright %>'

module.exports = {

  entry: Object.assign({}, MODULES, generateLocaleMap()),

  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery'
    },
    moment: 'moment',

    // moment locale files reference the moment lib with a relative require.
    // use our external reference instead.
    '../moment': 'moment',

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
        loader: 'awesome-typescript-loader',
        options: {
          useCache: true
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
    new CheckerPlugin(),
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

  glob.sync('locale/*.js').forEach(function(path) {
    if (path !== 'locale/_reset.js') {
      // strip out .js to get module name. also, path must start with ./
      map['dist/' + path.replace(/\.js$/, '')] = './' + path
    }
  })

  map['dist/locale-all'] = Object.values(map) // all locales combined
    .concat([ './locale/_reset.js' ]) // for resetting back to English

  return map
}
