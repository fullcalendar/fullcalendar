
// HACK for ProvidePlugin
require('@yarnpkg/pnpify').patchFs()

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin')
const { publicPackageStructs } = require('./scripts/lib/package-index')
const { buildAliasMap } = require('./scripts/lib/new-webpack')


/*
webpack --config webpack.tests.js --env PACKAGE_MODE=src
webpack --config webpack.tests.js --env PACKAGE_MODE=dist
*/
module.exports = (env) => {
  let packageMode = env.PACKAGE_MODE

  if (packageMode !== 'src' && packageMode !== 'dist') {
    throw new Error(`Invalid FC package mode: '${packageMode}'`)
  }

  return {
    mode: 'development',
    devtool: false, // because we already have SourceMapDevToolPlugin
    entry: {
      'all': './tmp/tests/index.js',
      // 'scrollgrid': './packages-premium/__tests__/src/scrollgrid.tsx'
    },
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'tmp/tests')
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ],
      alias: packageMode === 'src' ? buildAliasMap(publicPackageStructs) : {}
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
    optimization: {
      splitChunks: { // will automatically create a 'vendors' chunk with /node_modules/ packages
        chunks: 'all' // apply to sync and async chunks (we only do sync)
      }
    },
    plugins: [
      new webpack.SourceMapDevToolPlugin({ // inlined by default
        exclude: /vendors/ // don't make sourcemaps for the vendors chunk
      }),
      new HtmlWebpackPlugin({ // writes an html file with all necessary chunks
        // chunks: [ 'scrollgrid' ],
        // filename: 'scrollgrid.html',
        chunks: [ 'all' ],
        filename: 'all.html'
      }),
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
