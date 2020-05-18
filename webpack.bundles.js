const fs = require('fs')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { checkNoSymlinks } = require('./scripts/lib/new')
const { buildEntryMap, buildAliasMap } = require('./scripts/lib/new-webpack')


const { bundleStructs, packageStructs } = require('./scripts/lib/package-index')
checkNoSymlinks(bundleStructs) // can we avoid this if we only ever write js?

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: buildEntryMap(bundleStructs),
  output: {
    filename: '[name].js',
    path: __dirname,
    library: 'FullCalendar',
    libraryTarget: 'var'
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ],
    alias: buildAliasMap(packageStructs)
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader', options: { transpileOnly: true } }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: true } }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin()
  ],
  stats: {
    warningsFilter: /export .* was not found in/
  }
}




