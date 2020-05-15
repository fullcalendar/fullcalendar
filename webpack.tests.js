const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: false, // because we already have SourceMapDevToolPlugin
  entry: {
    'all': './tmp/tests-index.js',
    // 'scrollgrid': './packages-premium/__tests__/tsc/scrollgrid.js'
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'tmp/tests-built')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      }
    ]
  },
  optimization: {
    splitChunks: { // will automatically create a 'vendors' chunk with /node_modules/ packages
      chunks: 'all' // apply to sync and async chunks (we only do sync)
    }
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({ // inlined by default
      exclude: /vendors/ // don't make sourcemaps for the vendors chunk
    }),
    // new HtmlWebpackPlugin({ // writes an html file with all necessary chunks
    //   chunks: [ 'tests-manual/scrollgrid' ],
    //   filename: 'tests-manual/scrollgrid.html'
    // }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new MomentLocalesPlugin({
      localesToKeep: [ 'es' ], // a test relies on this
    }),
    new MomentTimezoneDataPlugin({
      matchZones: [ 'Europe/Moscow' ] // a test relies on this
    })
  ]
}
