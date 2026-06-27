import { join as joinPaths } from 'path'
import { readFile } from 'fs/promises'
import { createRequire } from 'module'
import { globby } from 'globby'
import handlebars from 'handlebars'
import { pkgLog } from '../../utils/log.ts'
import { srcExtensions, transpiledSubdir, transpiledExtension, esmExtension } from './config.ts'
import { standardScriptsDir } from '../../utils/script-runner.ts'
import { minifyCss, minifyJs } from './rollup-plugins.ts'

export interface PkgBundleStruct {
  pkgDir: string,
  pkgJson: any
  entryConfigMap: EntryConfigMap
  entryStructMap: { [entryAlias: string]: EntryStruct } // entryAlias like "index"
  copySrcToDest: CopyOperation[]
  miscWatchPaths: string[] // not CSS
  moduleConfig?: PkgModuleConfig
  globalConfig?: PkgGlobalConfig
  importRemaps?: Record<string, string>
}

export interface CopyOperation {
  src: string // absolute path
  transform?: (srcStr: string) => string | Promise<string>
  dest: string // relative to pkg's dist dir
}

export interface PkgModuleConfig {
  cssExtract?: string
  externalPkgs?: string[] // needed anymore; we always use deps/peerDeps no?
}

export interface PkgGlobalConfig {
  primaryGlobal: string
  sharedProp: string
  externalPkgs?: string[]
  externalGlobals?: Record<string, string>
  cssExtract?: string
}

export interface EntryConfig {
  format: 'module' | 'global' | 'css' | 'css-as-js'
  types?: string // relative to src dir, no leading "./", no extension
  src?: string // relative to src dir, no loeading "./", no extension
  dist?: string // relative to dist dir, no leading "./", no extension
  import?: string
  generator?: string
  sideEffects?: boolean
  primary?: boolean // for iifeSplit
  secondaryProp?: string // for iifeSplit
}

export interface EntryStruct {
  entryGlob: string // like "." or "./locales/*"
  entrySrcPath: string // transpiled src. like "<absroot>/index.js"
  entrySrcBase: string // transpiled src. like "<absroot>/index"
  content?: string
}

export interface PkgJsonBuildConfig {
  exports?: EntryConfigMap
  moduleConfig?: PkgModuleConfig
  globalConfig?: PkgGlobalConfig
  importRemaps?: Record<string, string>
  disableWatch?: boolean
}

export type EntryConfigMap = { [entryGlob: string]: EntryConfig }
export type EntryStructMap = { [entryAlias: string]: EntryStruct }
export type GlobalVarMap = { [importPath: string]: string }

export type GeneratorFunc = (
  config: { pkgDir: string, entryGlob: string, log: (message: string) => void }
) => (string | { [entryName: string]: string })

export type WatchPathsFunc = (pkgDir: string) => string[]

export async function resolveBuildConfig(
  pkgDir: string,
  buildConfigOrPath: string | PkgJsonBuildConfig | undefined,
): Promise<PkgJsonBuildConfig | undefined> {
  if (buildConfigOrPath === undefined) {
    return undefined
  }
  if (typeof buildConfigOrPath === 'object') {
    return buildConfigOrPath
  }
  // It's a string path
  const configPath = joinPaths(pkgDir, buildConfigOrPath)
  if (buildConfigOrPath.endsWith('.json')) {
    const content = await readFile(configPath, 'utf8')
    return JSON.parse(content)
  }
  if (buildConfigOrPath.endsWith('.js')) {
    const module = await import(configPath)
    return module.default
  }
  throw new Error(`buildConfig path must end in .json or .js: ${buildConfigOrPath}`)
}

export async function buildPkgBundleStruct(
  pkgDir: string,
  pkgJson: any,
): Promise<PkgBundleStruct> {
  const buildConfig = await resolveBuildConfig(pkgDir, pkgJson.buildConfig) || {}
  const entryConfigMap: EntryConfigMap = buildConfig.exports || {}
  const entryStructMap: { [entryAlias: string]: EntryStruct } = {}
  const copySrcToDest: CopyOperation[] = []
  const miscWatchPaths: string[] = []

  await Promise.all(
    Object.keys(entryConfigMap).map(async (entryGlob) => {
      const entryConfig = entryConfigMap[entryGlob]
      const isCssAsJs = entryConfig.format === 'css-as-js'

      if (entryConfig.format === 'css' || isCssAsJs) {
        if (entryGlob.includes('*')) {
          throw new Error('CSS copying does not support glob')
        }

        let srcPath: string

        if (entryConfig.import) {
          const require = createRequire(joinPaths(pkgDir, 'package.json'))
          srcPath = require.resolve(entryConfig.import)
        } else {
          srcPath = joinPaths(pkgDir, 'src', entryConfig.src || entryGlob)
        }

        if (isCssAsJs) {
          copySrcToDest.push({
            src: srcPath,
            transform: async (cssText) => {
              let jsText = await wrapCssAsJs(cssText)
              jsText = await minifyJs(jsText)
              return jsText
            },
            dest: removeDotSlash(entryGlob) + esmExtension,
          })
        } else {
          copySrcToDest.push({
            src: srcPath,
            dest: removeDotSlash(entryGlob),
          })
        }
      } else {
        const newEntryStructMap = entryConfig.generator ?
          await generateEntryStructMap(pkgDir, pkgJson, entryGlob, entryConfig.generator, miscWatchPaths) :
          await unglobEntryStructMap(pkgDir, entryGlob, entryConfig.src)

        Object.assign(entryStructMap, newEntryStructMap)
      }
    }),
  )

  return {
    pkgDir,
    pkgJson,
    entryConfigMap,
    entryStructMap,
    copySrcToDest,
    miscWatchPaths,
    moduleConfig: buildConfig.moduleConfig,
    globalConfig: buildConfig.globalConfig,
    importRemaps: buildConfig.importRemaps,
  }
}

// Source-File Entrypoints
// -------------------------------------------------------------------------------------------------

async function unglobEntryStructMap(
  pkgDir: string,
  entryGlob: string,
  maybeSrcAlias: string | undefined,
): Promise<EntryStructMap> {
  const srcGlob = maybeSrcAlias ? `./${maybeSrcAlias}` : entryGlob
  const entryStructMap: EntryStructMap = {}
  const massagedGlob =
    (srcGlob === '.' ? 'index' : removeDotSlash(srcGlob)) +
    '{' + srcExtensions.join(',') + '}'

  const transpiledDir = joinPaths(pkgDir, transpiledSubdir)
  const srcDir = joinPaths(pkgDir, 'src')
  const srcPaths = await globby(massagedGlob, { cwd: srcDir })

  if (!srcPaths.length) {
    throw new Error(`Glob '${entryGlob}' does not exist in package '${pkgDir}'`)
  }

  for (const srcPath of srcPaths) {
    for (const srcExtension of srcExtensions) {
      if (srcPath.endsWith(srcExtension)) {
        const entrySrcAlias = srcPath.substring(0, srcPath.length - srcExtension.length)
        const entrySrcBase = joinPaths(transpiledDir, entrySrcAlias)
        const entrySrcPath = entrySrcBase + transpiledExtension
        let entryAlias = entrySrcAlias

        if (maybeSrcAlias) {
          if (entryGlob.includes('*')) {
            throw new Error('Cannot remap glob entrypoints to other src files just yet')
          } else {
            entryAlias = entryGlob.replace(/^\.\//, '')
          }
        }

        entryStructMap[entryAlias] = { entryGlob, entrySrcPath, entrySrcBase }
      }
    }
  }

  return entryStructMap
}

// Dynamically-Generated Entrypoint Content
// -------------------------------------------------------------------------------------------------

async function generateEntryStructMap(
  pkgDir: string,
  pkgJson: any,
  entryGlob: string,
  generatorSubpath: string,
  miscWatchPaths: string[], // pass-by-reference, modified
): Promise<EntryStructMap> {
  const generatorPath = joinPaths(pkgDir, generatorSubpath)
  const generatorExports = await import(generatorPath)
  const generatorFunc: GeneratorFunc = generatorExports.default

  if (typeof generatorFunc !== 'function') {
    throw new Error('Generator must have a default function export')
  }

  const generatorConfig = { pkgDir, entryGlob, log: pkgLog.bind(undefined, pkgJson.name) }
  const generatorRes = await generatorFunc(generatorConfig)

  const transpiledDir = joinPaths(pkgDir, transpiledSubdir)
  const entryStructMap: EntryStructMap = {}

  if (typeof generatorRes === 'string') {
    if (entryGlob.includes('*')) {
      throw new Error('Generator string output can\'t have glob entrypoint name')
    }

    const entryAlias = entryGlob === '.' ? 'index' : removeDotSlash(entryGlob)
    const entrySrcBase = joinPaths(transpiledDir, entryAlias)
    const entrySrcPath = entrySrcBase + transpiledExtension

    entryStructMap[entryAlias] = {
      entryGlob,
      entrySrcPath,
      entrySrcBase,
      content: generatorRes,
    }
  } else if (typeof generatorRes === 'object') {
    if (!entryGlob.includes('*')) {
      throw new Error('Generator object output must have glob entrypoint name')
    }

    for (const key in generatorRes) {
      const entryAlias = removeDotSlash(entryGlob).replace('*', key)
      const entrySrcBase = joinPaths(transpiledDir, entryAlias)
      const entrySrcPath = entrySrcBase + transpiledExtension

      entryStructMap[entryAlias] = {
        entryGlob,
        entrySrcPath,
        entrySrcBase,
        content: generatorRes[key],
      }
    }
  } else {
    throw new Error('Invalid type of generator output')
  }

  miscWatchPaths.push(
    generatorPath,
    ...(generatorExports.getWatchPaths ? generatorExports.getWatchPaths(generatorConfig) : []),
  )

  return entryStructMap
}

export function entryStructsToContentMap(
  entryStructMap: EntryStructMap,
): { [path: string]: string } {
  const contentMap: { [path: string]: string } = {}

  for (const entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]

    if (typeof entryStruct.content === 'string') {
      contentMap[entryStruct.entrySrcPath] = entryStruct.content
    }
  }

  return contentMap
}

export function buildEntryDistAlias(
  entryAlias: string,
  entryGlob: string,
  entryConfig: EntryConfig,
): string {
  if (!entryConfig.dist) {
    return entryAlias
  }

  const distAlias = removeDotSlash(entryConfig.dist)

  if (!entryGlob.includes('*')) {
    return distAlias
  }

  const entryGlobAlias = removeDotSlash(entryGlob)
  const wildcardValue = extractWildcardValue(entryAlias, entryGlobAlias)

  return distAlias.replace('*', wildcardValue)
}

function extractWildcardValue(entryAlias: string, entryGlobAlias: string): string {
  const wildcardIndex = entryGlobAlias.indexOf('*')
  const prefix = entryGlobAlias.substring(0, wildcardIndex)
  const suffix = entryGlobAlias.substring(wildcardIndex + 1)

  if (
    entryAlias.startsWith(prefix) &&
    entryAlias.endsWith(suffix)
  ) {
    return entryAlias.substring(prefix.length, entryAlias.length - suffix.length)
  }

  throw new Error(`Entry '${entryAlias}' does not match glob '${entryGlobAlias}'`)
}

// External Packages
// -------------------------------------------------------------------------------------------------

export function computeModuleExternalPkgs(pkgBundleStruct: PkgBundleStruct): string[] {
  const { pkgJson } = pkgBundleStruct

  return [
    ...(pkgBundleStruct.moduleConfig?.externalPkgs || []),
    ...Object.keys({
      ...pkgJson.dependencies,
      ...pkgJson.peerDependencies,
      ...pkgJson.optionalDependencies,
    }),
  ]
}

export function computeGlobalExternalPkgs(pkgBundleStruct: PkgBundleStruct): string[] {
  return pkgBundleStruct.globalConfig?.externalPkgs || []
}

// CSS-AS-JS
// -------------------------------------------------------------------------------------------------

async function wrapCssAsJs(cssText: string): Promise<string> {
  const template = await getCssWrapTemplate()
  cssText = await minifyCss(cssText)
  return template({ cssTextAsJson: JSON.stringify(cssText) })
}

type HandlebarsTemplate = ReturnType<typeof handlebars.compile>

let _cssWrapTemplate: HandlebarsTemplate

async function getCssWrapTemplate(): Promise<HandlebarsTemplate> {
  return _cssWrapTemplate || (_cssWrapTemplate = await buildCssWrapTemplate())
}

async function buildCssWrapTemplate(): Promise<HandlebarsTemplate> {
  const templatePath = joinPaths(standardScriptsDir, 'config/inject-css.tpl')
  const templateText = await readFile(templatePath, 'utf8')
  return handlebars.compile(templateText)
}

// Utils
// -------------------------------------------------------------------------------------------------

function removeDotSlash(path: string): string {
  return path.replace(/^\.\//, '')
}
