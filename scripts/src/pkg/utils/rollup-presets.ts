import { readFile } from 'fs/promises'
import { join as joinPaths } from 'path'
import { RollupOptions, Plugin, OutputOptions, RollupWarning } from 'rollup'
import handlebars from 'handlebars'
import nodeResolvePlugin from '@rollup/plugin-node-resolve'
import dtsPlugin from 'rollup-plugin-dts'
import sourcemapsPlugin from 'rollup-plugin-sourcemaps'
import { default as commonjsPlugin } from '@rollup/plugin-commonjs'
import { default as jsonPlugin } from '@rollup/plugin-json'
import { default as postcssPlugin } from 'rollup-plugin-postcss'
import { mapProps } from '../../utils/lang.js'
import { MonorepoStruct } from '../../utils/monorepo-struct.js'
import { analyzePkg } from '../../utils/pkg-analysis.js'
import { readPkgJson } from '../../utils/pkg-json.js'
import { standardScriptsDir } from '../../utils/script-runner.js'
import {
  computeExternalPkgs,
  computeIifeExternalPkgs,
  computeIifeGlobals,
  computeOwnExternalPaths,
  computeOwnIifeExternalPaths,
  EntryStruct,
  entryStructsToContentMap,
  generateIifeContent,
  PkgBundleStruct,
  transpiledExtension,
  transpiledSubdir,
} from './bundle-struct.js'
import {
  externalizeExtensionsPlugin,
  externalizePathsPlugin,
  externalizePkgsPlugin,
  generatedContentPlugin,
  minifySeparatelyPlugin,
  rerootPlugin,
} from './rollup-plugins.js'

const assetExtensions = ['.css']

export function buildModuleOptions(
  pkgBundleStruct: PkgBundleStruct,
  esm: boolean,
  cjs: boolean,
  sourcemap: boolean,
): RollupOptions[] {
  if (esm || cjs) {
    return [{
      input: buildModuleInput(pkgBundleStruct),
      plugins: buildModulePlugins(pkgBundleStruct, sourcemap),
      output: [
        ...(esm ? [buildEsmOutputOptions(pkgBundleStruct, sourcemap)] : []),
        ...(cjs ? [buildCjsOutputOptions(pkgBundleStruct, sourcemap)] : []),
      ],
      onwarn,
    }]
  }

  return []
}

export function buildDtsOptions(pkgBundleStruct: PkgBundleStruct): RollupOptions {
  return {
    input: buildDtsInput(pkgBundleStruct),
    plugins: buildDtsPlugins(pkgBundleStruct),
    output: buildDtsOutputOptions(pkgBundleStruct),
    onwarn,
  }
}

export async function buildIifeOptions(
  pkgBundleStruct: PkgBundleStruct,
  monorepoStruct: MonorepoStruct,
  minify: boolean,
  sourcemap: boolean,
): Promise<RollupOptions[]> {
  const { entryConfigMap, entryStructMap } = pkgBundleStruct
  const banner = await buildBanner(pkgBundleStruct)
  const iifeContentMap = await generateIifeContent(pkgBundleStruct)
  const optionsObjs: RollupOptions[] = []

  for (let entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]
    const entryConfig = entryConfigMap[entryStruct.entryGlob]

    if (entryConfig.iife) {
      optionsObjs.push({
        input: buildIifeInput(entryStruct),
        plugins: buildIifePlugins(entryStruct, pkgBundleStruct, iifeContentMap, sourcemap, minify),
        output: buildIifeOutputOptions(entryStruct, entryAlias, pkgBundleStruct, monorepoStruct, banner, sourcemap),
        onwarn,
      })
    }
  }

  return optionsObjs
}

// Input
// -------------------------------------------------------------------------------------------------

type InputMap = { [entryAlias: string]: string }

function buildModuleInput(pkgBundleStruct: PkgBundleStruct): InputMap {
  return mapProps(pkgBundleStruct.entryStructMap, (entryStruct: EntryStruct) => {
    return entryStruct.entrySrcPath
  })
}

function buildIifeInput(entryStruct: EntryStruct): string {
  return entryStruct.entrySrcBase + '.iife' + transpiledExtension
}

function buildDtsInput(pkgBundleStruct: PkgBundleStruct): InputMap {
  return mapProps(pkgBundleStruct.entryStructMap, (entryStruct: EntryStruct) => {
    return entryStruct.entrySrcBase + '.d.ts'
  })
}

// Output
// -------------------------------------------------------------------------------------------------

function buildEsmOutputOptions(
  pkgBundleStruct: PkgBundleStruct,
  sourcemap: boolean,
): OutputOptions {
  return {
    format: 'esm',
    dir: joinPaths(pkgBundleStruct.pkgDir, 'dist'),
    entryFileNames: '[name].js',
    sourcemap,
  }
}

function buildCjsOutputOptions(
  pkgBundleStruct: PkgBundleStruct,
  sourcemap: boolean,
): OutputOptions {
  return {
    format: 'cjs',
    exports: 'named',
    dir: joinPaths(pkgBundleStruct.pkgDir, 'dist'),
    entryFileNames: '[name].cjs',
    sourcemap,
  }
}

function buildIifeOutputOptions(
  entryStruct: EntryStruct,
  entryAlias: string,
  pkgBundleStruct: PkgBundleStruct,
  monorepoStruct: MonorepoStruct,
  banner: string,
  sourcemap: boolean,
): OutputOptions {
  const { pkgDir, iifeGlobalsMap } = pkgBundleStruct
  const globalName = iifeGlobalsMap[entryStruct.entryGlob]

  return {
    format: 'iife',
    banner,
    file: joinPaths(pkgDir, 'dist', entryAlias) + '.global.js',
    globals: computeIifeGlobals(pkgBundleStruct, monorepoStruct),
    ...(
      globalName
        ? { name: globalName }
        : { exports: 'none' }
    ),
    sourcemap,
  }
}

function buildDtsOutputOptions(pkgBundleStruct: PkgBundleStruct): OutputOptions {
  return {
    format: 'esm',
    dir: joinPaths(pkgBundleStruct.pkgDir, 'dist'),
    entryFileNames: '[name].d.ts',
  }
}

// Plugins Lists
// -------------------------------------------------------------------------------------------------

function buildModulePlugins(pkgBundleStruct: PkgBundleStruct, sourcemap: boolean): Plugin[] {
  const { pkgDir, entryStructMap } = pkgBundleStruct

  return [
    rerootAssetsPlugin(pkgDir),
    externalizePkgsPlugin(
      computeExternalPkgs(pkgBundleStruct),
    ),
    generatedContentPlugin(
      entryStructsToContentMap(entryStructMap),
    ),
    ...buildJsPlugins(pkgBundleStruct),
    ...(sourcemap ? [sourcemapsPlugin()] : []), // load preexisting sourcemaps
  ]
}

function buildIifePlugins(
  currentEntryStruct: EntryStruct,
  pkgBundleStruct: PkgBundleStruct,
  iifeContentMap: { [path: string]: string },
  sourcemap: boolean,
  minify: boolean,
): Plugin[] {
  const { pkgDir, entryStructMap } = pkgBundleStruct

  return [
    rerootAssetsPlugin(pkgDir),
    externalizePkgsPlugin(
      computeIifeExternalPkgs(pkgBundleStruct),
    ),
    externalizePathsPlugin({
      paths: computeOwnIifeExternalPaths(currentEntryStruct, pkgBundleStruct),
    }),
    generatedContentPlugin({
      ...entryStructsToContentMap(entryStructMap),
      ...iifeContentMap,
    }),
    ...buildJsPlugins(pkgBundleStruct),
    ...(sourcemap ? [sourcemapsPlugin()] : []),
    ...(minify ? [minifySeparatelyPlugin()] : []),
  ]
}

function buildDtsPlugins(pkgBundleStruct: PkgBundleStruct): Plugin[] {
  return [
    externalizeAssetsPlugin(),
    externalizePkgsPlugin(
      computeExternalPkgs(pkgBundleStruct),
    ),
    // rollup-plugin-dts normally gets confused with code splitting. this helps a lot.
    externalizePathsPlugin({
      paths: computeOwnExternalPaths(pkgBundleStruct),
    }),
    dtsPlugin(),
    nodeResolvePlugin(),
  ]
}

function buildJsPlugins(pkgBundleStruct: PkgBundleStruct): Plugin[] {
  const pkgAnalysis = analyzePkg(pkgBundleStruct.pkgDir)

  if (pkgAnalysis.isTests) {
    return buildTestsJsPlugins(pkgBundleStruct)
  } else {
    return buildNormalJsPlugins(pkgBundleStruct)
  }
}

function buildNormalJsPlugins(pkgBundleStruct: PkgBundleStruct): Plugin[] {
  const { pkgDir, pkgJson } = pkgBundleStruct

  return [
    nodeResolvePlugin(),
    cssPlugin({
      inject: {
        importId: pkgJson.name === '@fullcalendar/core' ?
          joinPaths(pkgDir, transpiledSubdir, 'styleUtils' + transpiledExtension) :
          '@fullcalendar/core',
        importProp: 'injectStyles',
      },
    }),
  ]
}

function buildTestsJsPlugins(pkgBundleStruct: PkgBundleStruct): Plugin[] {
  return [
    nodeResolvePlugin({ // determines index.js and .js/cjs/mjs
      browser: true, // for xhr-mock (use non-node shims that it wants to)
      preferBuiltins: false, // for xhr-mock (use 'url' npm package)
    }),
    commonjsPlugin(), // for moment and moment-timezone
    jsonPlugin(), // for moment-timezone
    cssPlugin({ inject: true }),
  ]
}

// Plugins Wrappers
// -------------------------------------------------------------------------------------------------

interface CssInjector {
  importId: string
  importProp: string
}

function cssPlugin(options?: { inject?: CssInjector | boolean }): Plugin {
  const { inject } = options || {}

  return postcssPlugin({
    config: {
      path: joinPaths(standardScriptsDir, 'config/postcss.config.cjs'),
      ctx: {}, // arguments given to config file
    },
    inject: typeof inject === 'object' ?
      (cssVarName: string) => {
        return `import { ${inject.importProp} } from ${JSON.stringify(inject.importId)};\n` +
          `injectStyles(${cssVarName});\n`
      } :
      (inject || false),
  })
}

function rerootAssetsPlugin(pkgDir: string): Plugin {
  return rerootPlugin({
    extensions: assetExtensions,
    oldRoot: joinPaths(pkgDir, 'dist', '.tsout'),
    newRoot: joinPaths(pkgDir, 'src'),
  })
}

function externalizeAssetsPlugin(): Plugin {
  return externalizeExtensionsPlugin(assetExtensions)
}

// Misc
// -------------------------------------------------------------------------------------------------

async function buildBanner(pkgBundleStruct: PkgBundleStruct): Promise<string> {
  const { pkgDir, pkgJson } = pkgBundleStruct

  const pkgAnalysis = analyzePkg(pkgDir)
  const basePkgJson = await readPkgJson(pkgAnalysis.metaRootDir) // TODO: use a cached version
  const fullPkgJson = { ...basePkgJson, ...pkgJson }

  // TODO: cache the template
  const templatePath = joinPaths(standardScriptsDir, 'config/banner.tpl')
  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)

  return template(fullPkgJson)
}

function onwarn(warning: RollupWarning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    console.error(warning)
  }
}
