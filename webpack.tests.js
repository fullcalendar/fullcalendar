
// HACK for ProvidePlugin
require('@yarnpkg/pnpify').patchFs()

const path = require('path')
const webpack = require('webpack')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin')
const { publicPackageStructs } = require('./scripts/lib/package-index')
const { buildAliasMap } = require('./scripts/lib/new-webpack')


module.exports = (env) => {
  let fromSrc = env && env.PACKAGES_FROM_SOURCE

  return {
    mode: 'development',
    devtool: 'source-map',
    entry: './tmp/tests/index.js',
    output: {
      filename: 'all.js',
      path: path.join(__dirname, 'tmp/tests')
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ],
      alias: fromSrc ? buildAliasMap(publicPackageStructs) : {}
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
            { loader: 'style-loader' },
            { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
            { loader: 'postcss-loader', options: { sourceMap: true } }
          ]
        }
      ]
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
    ],
    stats: {
      warningsFilter: /export .* was not found in/
    }
  }
}
