const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { checkNoSymlinks } = require('./scripts/lib/new')
const { buildEntryMap, buildAliasMap } = require('./scripts/lib/new-webpack')


const { bundleStructs, publicPackageStructs } = require('./scripts/lib/package-index')
checkNoSymlinks(bundleStructs) // can we avoid this if we only ever write js?

module.exports = (env) => {
  let doSourceMaps = !(env && env.NO_SOURCE_MAPS)

  return {
    mode: 'development',
    devtool: doSourceMaps ? 'source-map' : false,
    entry: buildEntryMap(bundleStructs),
    output: {
      filename: '[name].js',
      path: __dirname,
      library: 'FullCalendar',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ],
      alias: buildAliasMap(publicPackageStructs)
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
            { loader: 'css-loader', options: { sourceMap: doSourceMaps, importLoaders: 1 } },
            { loader: 'postcss-loader', options: { sourceMap: doSourceMaps } }
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
}
