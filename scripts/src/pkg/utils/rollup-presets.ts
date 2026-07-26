import commonjsPluginLib from '@rollup/plugin-commonjs'
import jsonPluginLib from '@rollup/plugin-json'
import nodeResolvePlugin from '@rollup/plugin-node-resolve'
import replacePluginLib from '@rollup/plugin-replace'
import injectPluginLib from '@rollup/plugin-inject'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { dirname, join as joinPaths, resolve as resolvePath } from 'path'
import { fileURLToPath } from 'url'
import { type OutputOptions, type Plugin, type RollupOptions } from 'rollup'
import dtsPlugin from 'rollup-plugin-dts'
import postcssPluginLib from 'rollup-plugin-postcss'
import sourcemapsPlugin from 'rollup-plugin-sourcemaps'
import iifeSplitPlugin, { type IifeSplitOptions } from 'rollup-plugin-iife-split'
import { analyzePkg } from '../../utils/pkg-analysis.ts'
import { readPkgJson } from '../../utils/pkg-json.ts'
import { standardScriptsDir } from '../../utils/script-runner.ts'
import {
  buildEntryDistAlias,
  computeGlobalExternalPkgs,
  computeModuleExternalPkgs,
  entryStructsToContentMap,
  type PkgGlobalConfig,
  type PkgBundleStruct,
} from './bundle-struct.ts'
import {
  assetExtensions,
  esmExtension,
} from './config.ts'
import { HashGenerator } from './hash-generator.ts'
import transformClassNamesPlugin from './rollup-plugins-theming.ts'
import {
  copyFilesPlugin,
  cssModuleTypesPlugin,
  externalizeExtensionsPlugin,
  externalizePkgsPlugin,
  generatedContentPlugin,
  massageDtsPlugin,
  remapImportsPlugin,
  rerootPlugin,
  resolveExternalForDts,
} from './rollup-plugins.ts'

const commonjsPlugin = cjsInterop(commonjsPluginLib)
const jsonPlugin = cjsInterop(jsonPluginLib)
const postcssPlugin = cjsInterop(postcssPluginLib)
const replacePlugin = cjsInterop(replacePluginLib)
const injectPlugin = cjsInterop(injectPluginLib)

const __dirname = dirname(fileURLToPath(import.meta.url))
const debugDir = joinPaths(__dirname, 'debug')

export function buildModuleOptions(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  sourcemaps: boolean,
): RollupOptions | undefined {
  const inputs = buildModuleInput(pkgBundleStruct)

  if (Object.keys(inputs).length) {
    return {
      input: buildModuleInput(pkgBundleStruct),
      plugins: buildModulePlugins(
        pkgBundleStruct,
        isDev,
        sourcemaps, // sourcemapLoading
      ),
      output: buildModuleOutputOptions(pkgBundleStruct, isDev, sourcemaps),
      onwarn(warning) {
        if (warning.code !== 'CIRCULAR_DEPENDENCY') {
          console.error(`${pkgBundleStruct.pkgDir}(esm): ${warning}`)
        }
      },
    }
  }
}

export async function buildGlobalOptions(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  sourcemaps: boolean,
): Promise<RollupOptions> {
  const pkgAnalysis = analyzePkg(pkgBundleStruct.pkgDir)

  return {
    input: buildGlobalInput(pkgBundleStruct),
    plugins: await buildGlobalPlugins(
      pkgBundleStruct,
      isDev,
      sourcemaps,
    ),
    output: await buildGlobalOutputOptions(pkgBundleStruct, sourcemaps),
    onwarn(warning) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        console.error(`${pkgBundleStruct.pkgDir}(iife): ${warning}`)
      }
    },
    // Workaround for rollup being aggressive about tree-shacking
    treeshake: !pkgAnalysis.isTests,
  }
}

export function buildDtsOptions(pkgBundleStruct: PkgBundleStruct, isDev: boolean): RollupOptions | undefined {
  const inputs = buildDtsInput(pkgBundleStruct)

  if (Object.keys(inputs).length) {
    return {
      input: buildDtsInput(pkgBundleStruct),
      plugins: buildDtsPlugins(pkgBundleStruct),
      output: buildDtsOutputOptions(pkgBundleStruct, isDev),
      onwarn(warning) {
        if (warning.code !== 'CIRCULAR_DEPENDENCY') {
          console.error(`${pkgBundleStruct.pkgDir}(dts): ${warning}`)
        }
      },
    }
  }
}

// Input
// -------------------------------------------------------------------------------------------------

type InputMap = { [entryAlias: string]: string }

function buildModuleInput(pkgBundleStruct: PkgBundleStruct): InputMap {
  const { entryConfigMap, entryStructMap } = pkgBundleStruct
  let inputMap: InputMap = {}

  for (let entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]
    const entryConfig = entryConfigMap[entryStruct.entryGlob]

    if (entryConfig.format === 'module') {
      const distAlias = buildEntryDistAlias(entryAlias, entryStruct.entryGlob, entryConfig)

      inputMap[distAlias] = entryStruct.entrySrcPath
    }
  }

  return inputMap
}

function buildGlobalInput(pkgBundleStruct: PkgBundleStruct): InputMap {
  const { entryConfigMap, entryStructMap } = pkgBundleStruct
  const inputMap: InputMap = {}

  for (let entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]
    const entryConfig = entryConfigMap[entryStruct.entryGlob]

    if (entryConfig.format === 'global') {
      const distAlias = buildEntryDistAlias(entryAlias, entryStruct.entryGlob, entryConfig)

      inputMap[distAlias] = entryStruct.entrySrcPath
    }
  }

  return inputMap
}

function buildDtsInput(pkgBundleStruct: PkgBundleStruct): InputMap {
  const { entryConfigMap, entryStructMap } = pkgBundleStruct
  let inputMap: InputMap = {}

  for (let entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]
    const entryConfig = entryConfigMap[entryStruct.entryGlob]

    if (entryConfig.types) {
      if (entryConfig.format === 'module') {
        // HACK: will execute many times per-file
        // HACK: don't hardcode tsout dir
        const dtsAlias = entryConfig.dist
          ? buildEntryDistAlias(entryAlias, entryStruct.entryGlob, entryConfig)
          : entryConfig.types

        inputMap[dtsAlias] = joinPaths(pkgBundleStruct.pkgDir, 'dist/.tsout', entryConfig.types + '.d.ts')
      }
    } else if (entryConfig.format === 'module') {
      const distAlias = buildEntryDistAlias(entryAlias, entryStruct.entryGlob, entryConfig)

      inputMap[distAlias] = entryStruct.entrySrcBase + '.d.ts'
    }
  }

  return inputMap
}

// Output
// -------------------------------------------------------------------------------------------------

function buildModuleOutputOptions(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  sourcemapOutput: boolean,
): OutputOptions {
  return {
    format: 'esm',
    dir: joinPaths(pkgBundleStruct.pkgDir, 'dist'),
    entryFileNames: '[name]' + esmExtension,
    chunkFileNames: 'chunks/' + (isDev ? '[name]' : '[hash]') + esmExtension,
    sourcemap: sourcemapOutput,

    // don't have memberless import statement merely to preserve import order
    hoistTransitiveImports: false,
  }
}

async function buildGlobalOutputOptions(
  pkgBundleStruct: PkgBundleStruct,
  sourcemapOutput: boolean,
): Promise<OutputOptions> {
  const { pkgDir } = pkgBundleStruct
  const { isTests } = analyzePkg(pkgDir)

  return {
    format: isTests
      ? 'iife' // for tests, which HACKILY don't use iifeSplitPlugin
      : 'esm', // for iifeSplitPlugin. also for DEBUGGING as ESM
    dir: joinPaths(pkgBundleStruct.pkgDir, 'dist'),
    entryFileNames: '[name].js',
    // chunkFileNames: 'global-chunks/[name]-[hash]' + esmExtension, // for DEBUGGING as ESM
    globals: pkgBundleStruct.globalConfig?.externalGlobals || {}, // comment for DEBUGGING as ESM
    sourcemap: sourcemapOutput,
    banner: isTests
      ? undefined
      : await buildBanner(pkgBundleStruct),

    // ...the iifeSplitPlugin plugin fills in the rest...

    // don't have memberless import statement merely to preserve import order
    hoistTransitiveImports: false,
  }
}

function buildDtsOutputOptions(pkgBundleStruct: PkgBundleStruct, isDev: boolean): OutputOptions {
  return {
    format: 'esm',
    dir: joinPaths(pkgBundleStruct.pkgDir, 'dist'),
    entryFileNames: '[name].d.ts',
    chunkFileNames: 'chunks/' + (isDev ? '[name]' : '[hash]') + '.d.ts',

    // don't have memberless import statement merely to preserve import order
    hoistTransitiveImports: false,
  }
}

// Plugins Lists
// -------------------------------------------------------------------------------------------------

function buildModulePlugins(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  sourcemaps: boolean,
): Plugin[] {
  const { pkgDir, pkgJson, entryStructMap } = pkgBundleStruct
  const { isPublicMui } = analyzePkg(pkgDir)

  return [
    remapImportsPlugin({
      mappings: pkgBundleStruct.importRemaps || {},
      forceExternal: true,
    }),
    rerootAssetsPlugin(pkgDir),
    externalizePkgsPlugin({
      pkgNames: computeModuleExternalPkgs(pkgBundleStruct),
    }),
    generatedContentPlugin(
      entryStructsToContentMap(entryStructMap),
    ),
    copyFilesPlugin({
      srcToDest: pkgBundleStruct.copySrcToDest,
    }),
    (/^@fullcalendar\/p?react$/.test(pkgJson.name) || isPublicMui || pkgBundleStruct.themeName) &&
      transformClassNamesPlugin(
        !isDev,
        isPublicMui,
        pkgBundleStruct.themeName && {
          name: pkgBundleStruct.themeName,
          pkgDir,
        },
      ), // must go after copying
    ...buildJsPlugins(
      pkgBundleStruct,
      isDev,
      pkgBundleStruct.moduleConfig?.cssExtract || '',
    ),
    sourcemaps && sourcemapsPlugin(), // source map *loading*
  ].filter(Boolean) as Plugin[]
}

async function buildGlobalPlugins(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  sourcemaps: boolean,
): Promise<Plugin[]> {
  const { pkgDir, entryStructMap } = pkgBundleStruct
  const { isPublicMui, isTests } = analyzePkg(pkgDir)

  // HACK. path to other package
  const jasmineUtilsFile = resolvePath(
    joinPaths(__dirname, '../../../../packages/vanilla-tests/dist/.tsout/lib/global-utils.js'),
  )

  return [
    isTests &&
      injectPlugin({
        // NOTE: keel in sync with standard/packages/vanilla-tests/src/lib/global-utils.ts
        spyOnCalendarCallback: [jasmineUtilsFile, 'spyOnCalendarCallback'],
        pushOptions: [jasmineUtilsFile, 'pushOptions'],
        createCalendarElement: [jasmineUtilsFile, 'createCalendarElement'],
        initCalendar: [jasmineUtilsFile, 'initCalendar'],
        getCurrentOptions: [jasmineUtilsFile, 'getCurrentOptions'],
        describeOptions: [jasmineUtilsFile, 'describeOptions'],
        describeValues: [jasmineUtilsFile, 'describeValues'],
        describeTimeZones: [jasmineUtilsFile, 'describeTimeZones'],
        describeTimeZone: [jasmineUtilsFile, 'describeTimeZone'],
        oneCall: [jasmineUtilsFile, 'oneCall'],
        spyOnMethod: [jasmineUtilsFile, 'spyOnMethod'],
        spyCall: [jasmineUtilsFile, 'spyCall'],
      }),
    remapImportsPlugin({
      mappings: pkgBundleStruct.importRemaps || {},
    }),
    !isTests && // HACK around recent plugin bug
      iifeSplitPlugin(
        buildGlobalSplitOptions(pkgBundleStruct),
      ),
    rerootAssetsPlugin(pkgDir),
    externalizePkgsPlugin({
      pkgNames: computeGlobalExternalPkgs(pkgBundleStruct),
    }),
    generatedContentPlugin(
      entryStructsToContentMap(entryStructMap),
    ),
    transformClassNamesPlugin(
      !isDev,
      isPublicMui,
      pkgBundleStruct.themeName && {
        name: pkgBundleStruct.themeName,
        pkgDir,
      },
    ),
    ...buildJsPlugins(
      pkgBundleStruct,
      isDev,
      pkgBundleStruct.globalConfig?.cssExtract || '',
    ),
    sourcemaps && sourcemapsPlugin(), // source map *loading*
  ].filter(Boolean) as Plugin[]
}

function buildDtsPlugins(pkgBundleStruct: PkgBundleStruct): Plugin[] {
  return [
    remapImportsPlugin({
      mappings: pkgBundleStruct.importRemaps || {},
      forceExternal: true,
    }),
    cssModuleTypesPlugin(), // Handle CSS module imports before dtsPlugin
    externalizeAssetsPlugin(),
    externalizePkgsPlugin({
      pkgNames: computeModuleExternalPkgs(pkgBundleStruct),
      // moduleSideEffects: true, // for including ambient declarations in other packages
    }),
    resolveExternalForDts({
      // debug: true,
    }),
    dtsPlugin(),
    massageDtsPlugin({
      mappings: pkgBundleStruct.importRemaps || {},
    }),
    nodeResolvePlugin({
      // in current package's package.json, ignore sideEffects entry
      // (we currently dont even do this)
      ignoreSideEffectsForRoot: true,
    }),
  ]
}

function buildJsPlugins(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  cssExtract: string,
): Plugin[] {
  const pkgAnalysis = analyzePkg(pkgBundleStruct.pkgDir)

  if (pkgAnalysis.isTests) {
    return buildTestJsPlugins()
  } else {
    return buildNormalJsPlugins(pkgBundleStruct, isDev, cssExtract)
  }
}

function buildNormalJsPlugins(
  pkgBundleStruct: PkgBundleStruct,
  isDev: boolean,
  cssExtract: string,
): Plugin[] {
  const { pkgJson } = pkgBundleStruct

  return [
    // HACK because nodeResolvePlugin was strangely causing the './side-effects' import to be
    // tree-shaken away
    !/^@fullcalendar\/p?react-scheduler$/.test(pkgJson.name) &&
      nodeResolvePlugin({
        // in current package's package.json, ignore sideEffects entry
        // (we currently dont even do this)
        ignoreSideEffectsForRoot: true,
      }),
    commonjsPlugin(), // for React :(
    cssPlugin({
      extract: cssExtract,
      minifyClassNames: !isDev,
    }),
    replacePlugin({
      delimiters: ['<%= ', ' %>'], // affect all "values" below
      preventAssignment: true,
      values: {
        releaseDate: new Date().toISOString().replace(/T.*/, ''), // just YYYY-MM-DD
        pkgName: pkgJson.name,
        pkgVersion: pkgJson.version,
      },
    }),
    replacePlugin({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(
          isDev
            ? 'development'
            : 'production',
        ),
      },
    }),
  ].filter(Boolean) as Plugin[]
}

function buildTestJsPlugins(): Plugin[] {
  return [
    nodeResolvePlugin({ // determines index.js and .js/cjs/mjs
      browser: true, // for xhr-mock (use non-node shims that it wants to)
      preferBuiltins: false, // for xhr-mock (use 'url' npm package)
      ignoreSideEffectsForRoot: true,
    }),
    commonjsPlugin(), // for moment and moment-timezone
    jsonPlugin(), // for moment-timezone
    cssPlugin({
      // have JS store and attach CSS
      // BUG: in JS, the CSS string gets written twice for some reason
      extract: false,
      inject: true,
    }),
    replacePlugin({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('development'),
      },
    }),
  ]
}

function buildGlobalSplitOptions(pkgBundleStruct: PkgBundleStruct): IifeSplitOptions {
  const { entryConfigMap, entryStructMap } = pkgBundleStruct
  let primaryAlias: string | undefined
  const secondaryProps: Record<string, string> = {}

  for (let entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]
    const entryConfig = entryConfigMap[entryStruct.entryGlob]

    if (entryConfig.format === 'global') {
      const distAlias = buildEntryDistAlias(entryAlias, entryStruct.entryGlob, entryConfig)

      if (entryConfig.primary) {
        primaryAlias = distAlias
      } else if (entryConfig.secondaryProp) {
        secondaryProps[distAlias] = entryConfig.secondaryProp
      }
    }
  }

  const globalConfig: Partial<PkgGlobalConfig> = pkgBundleStruct.globalConfig || {}
  return {
    primary: primaryAlias || '',
    primaryGlobal: globalConfig.primaryGlobal || '',
    secondaryProps,
    sharedProp: globalConfig.sharedProp || '',
    unshared(id) {
      // includes the built @fullcalendar/preact locale files duplicated in single-locale and locales-all
      return /\/locales\/[\w-]+\.js$/.test(id)
    },
    // debugDir,
    // skipRequireGlobals: true,
  }
}

// Plugins Wrappers
// -------------------------------------------------------------------------------------------------

function cssPlugin(options?: {
  extract?: boolean | string,
  minifyClassNames?: boolean,
  inject?: boolean,
}): Plugin {
  const { extract, minifyClassNames, inject } = options || {}

  return postcssPlugin({
    config: {
      path: joinPaths(standardScriptsDir, 'config/postcss.config.cjs'),
      ctx: {}, // arguments given to config file
    },
    modules: {
      generateScopedName(localName: string, resourcePath: string) {
        return minifyClassNames
          ? 'fc-' + hashGenerator.generate(localName + resourcePath)
          : 'f-' + localName
      },
    },
    extract,
    inject: inject || false,
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

  return template(fullPkgJson).trim()
}

function cjsInterop<DefaultExport>(namespace: { default: DefaultExport }): DefaultExport {
  return namespace.default || (namespace as DefaultExport)
}

const pkgManifestJson = readFileSync(
  joinPaths(__dirname, '..', '..', '..', '..', 'package.json'), // in standard root
  'utf8',
)
const pkgManifest = JSON.parse(pkgManifestJson)
if (!pkgManifest.version) {
  throw new Error('Must have package.json#version')
}
const hashGenerator = new HashGenerator(2, pkgManifest.version)
