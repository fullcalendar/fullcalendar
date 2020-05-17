const path = require('path')
const globby = require('globby')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


const PKG_CONFIGS = [
  'packages?(-premium)/*/package.json',
  '!**/__tests__/package.json'
]
const DEPS_ALWAYS_INTERNAL = [
  '@fullcalendar/core-vdom',
  'preact'
]
const FORCE_EXTERNAL_CSS = Boolean(process.env.FORCE_EXTERNAL_CSS)


let pkgStructs = buildPkgStructs()
module.exports = [
  buildNormalPkgConfig(pkgStructs),
  buildBundlePkgConfig(pkgStructs)
]


function buildNormalPkgConfig(allStructs) {
  let normalStructs = allStructs.filter((struct) => !struct.isBundle)
  let externalsMap = buildExternalsMap(allStructs)

  for (let internalDep of DEPS_ALWAYS_INTERNAL) {
    delete externalsMap[internalDep]
  }

  return buildConfig(
    buildEntryMap(normalStructs),
    buildAliasMap(allStructs),
    Object.keys(externalsMap),
    false, // forBrowser
    FORCE_EXTERNAL_CSS // externalCss
  )
}


function buildBundlePkgConfig(allStructs) {
  let bundleStructs = allStructs.filter((struct) => struct.isBundle)

  return buildConfig(
    buildEntryMap(bundleStructs),
    buildAliasMap(allStructs),
    [], // no externals, include all
    true, // forBrowser
    true // externalCss
  )
}


function buildConfig(entryMap, aliasMap, externals, forBrowser, externalCss) {
  return {
    mode: 'development',
    devtool: 'source-map',
    entry: entryMap,
    output: {
      filename: '[name].js',
      path: __dirname,
      library: forBrowser ? 'FullCalendar' : '',
      libraryTarget: forBrowser ? 'var' : 'commonjs'
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ],
      alias: aliasMap
    },
    externals,
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
            externalCss ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
            { loader: 'postcss-loader', options: { sourceMap: true } }
          ]
        }
      ]
    },
    plugins: externalCss ? [ new MiniCssExtractPlugin() ] : [],
    stats: {
      warningsFilter: /export .* was not found in/
    }
  }
}


function buildPkgStructs() {
  return globby.sync(PKG_CONFIGS).map((pkgConfigPath) => {
    let pkgConfig = require('./' + pkgConfigPath)
    let name = pkgConfig.name
    let entry = path.basename(pkgConfig.module || pkgConfig.main, '.js')
    let entrySrc = path.join(pkgConfigPath, '../src', entry) // no extension
    let entryDist = path.join(pkgConfigPath, '../dist', entry) // no extension

    return {
      name,
      isBundle: /\/bundle\//.test(pkgConfigPath), // TODO: not OS-flexible? others?
      entrySrc,
      entryDist,
      deps: { ...pkgConfig.dependencies, ...pkgConfig.peerDependencies }
    }
  })
}


function buildEntryMap(pkgStructs) {
  let entryMap = {}

  for (let pkgStruct of pkgStructs) {
    entryMap[pkgStruct.entryDist] = './' + pkgStruct.entrySrc // will resolve the lack of extension
  }

  return entryMap
}


function buildAliasMap(pkgStructs) {
  let aliasMap = {}

  for (let pkgStruct of pkgStructs) {
    aliasMap[pkgStruct.name + '$'] = path.join(__dirname, pkgStruct.entrySrc)
  }

  return aliasMap
}


function buildExternalsMap(pkgStructs) { // as an array of strings
  let externalsMap = {}

  for (let pkgStruct of pkgStructs) {
    externalsMap[pkgStruct.name] = true // the package itself
    Object.assign(externalsMap, pkgStruct.deps) // its deps
  }

  return externalsMap
}
