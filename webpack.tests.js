const path = require('path')
const webpack = require('webpack')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'sourcemap',
  entry: './tests-index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      }
    ]
  },
  output: {
    filename: 'tests-all.js',
    path: __dirname
  },
  plugins: [
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
