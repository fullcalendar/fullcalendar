import { join as joinPaths } from 'path'
import { globby } from 'globby'
import { MonorepoStruct, computeLocalDepDirs } from '../../utils/monorepo-struct.js'
import { filterProps } from '../../utils/lang.js'
import { pkgLog } from '../../utils/log.js'
import { srcExtensions, transpiledSubdir, transpiledExtension, srcIifeSubextension } from './config.js'

export interface PkgBundleStruct {
  pkgDir: string,
  pkgJson: any
  entryConfigMap: EntryConfigMap
  entryStructMap: { [entryAlias: string]: EntryStruct } // entryAlias like "index"
  iifeGlobalsMap: IifeGlobalsMap
  miscWatchPaths: string[]
}

export interface EntryConfig {
  generator?: string
  iifeGenerator?: string
  iife?: boolean
}

export interface EntryStruct {
  entryGlob: string // like "." or "./locales/*"
  entrySrcPath: string // transpiled src. like "<absroot>/index.js"
  entrySrcBase: string // transpiled src. like "<absroot>/index"
  content?: string
}

export interface PkgJsonBuildConfig {
  exports?: EntryConfigMap
  iifeGlobals?: IifeGlobalsMap
}

export type EntryConfigMap = { [entryGlob: string]: EntryConfig }
export type EntryStructMap = { [entryAlias: string]: EntryStruct }
export type IifeGlobalsMap = { [importPath: string]: string }

export type GeneratorFunc = (
  config: { pkgDir: string, entryGlob: string, log: (message: string) => void }
) => (string | { [entryName: string]: string })

export type IifeGeneratorFunc = (
  config: { pkgDir: string, entryAlias: string, log: (message: string) => void }
) => string

export type WatchPathsFunc = (pkgDir: string) => string[]

export async function buildPkgBundleStruct(
  pkgDir: string,
  pkgJson: any,
): Promise<PkgBundleStruct> {
  const buildConfig: PkgJsonBuildConfig = pkgJson.buildConfig || {}
  const entryConfigMap: EntryConfigMap = buildConfig.exports || {}
  const entryStructMap: { [entryAlias: string]: EntryStruct } = {}
  const iifeGlobalsMap: IifeGlobalsMap = buildConfig.iifeGlobals || {}
  const miscWatchPaths: string[] = []

  await Promise.all(
    Object.keys(entryConfigMap).map(async (entryGlob) => {
      const entryConfig = entryConfigMap[entryGlob]
      const newEntryStructMap = entryConfig.generator ?
        await generateEntryStructMap(pkgDir, pkgJson, entryGlob, entryConfig.generator, miscWatchPaths) :
        await unglobEntryStructMap(pkgDir, entryGlob)

      Object.assign(entryStructMap, newEntryStructMap)
    }),
  )

  return { pkgDir, pkgJson, entryConfigMap, entryStructMap, iifeGlobalsMap, miscWatchPaths }
}

// Source-File Entrypoints
// -------------------------------------------------------------------------------------------------

async function unglobEntryStructMap(
  pkgDir: string,
  entryGlob: string,
): Promise<EntryStructMap> {
  const entryStructMap: EntryStructMap = {}
  const massagedGlob =
    (entryGlob === '.' ? 'index' : removeDotSlash(entryGlob)) +
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
        const entryAlias = srcPath.substring(0, srcPath.length - srcExtension.length)
        const entrySrcBase = joinPaths(transpiledDir, entryAlias)
        const entrySrcPath = entrySrcBase + transpiledExtension

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
      throw new Error('Generator string output can\'t have blob entrypoint name')
    }

    const entrySrcBase = joinPaths(transpiledDir, entryGlob)
    const entrySrcPath = entrySrcBase + transpiledExtension
    const entryAlias = removeDotSlash(entryGlob)

    entryStructMap[entryAlias] = {
      entryGlob,
      entrySrcPath,
      entrySrcBase,
      content: generatorRes,
    }
  } else if (typeof generatorRes === 'object') {
    if (entryGlob.includes('*')) {
      throw new Error('Generator object output must have blob entrypoint name')
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

export async function generateIifeContent(
  pkgBundleStruct: PkgBundleStruct,
): Promise<{ [path: string]: string }> {
  const { pkgDir, entryConfigMap, entryStructMap } = pkgBundleStruct
  const contentMap: { [path: string]: string } = {}

  for (const entryAlias in entryStructMap) {
    const entryStruct = entryStructMap[entryAlias]
    const entryConfig = entryConfigMap[entryStruct.entryGlob]
    const { iifeGenerator } = entryConfig

    if (iifeGenerator) {
      const iifeGeneratorPath = joinPaths(pkgDir, iifeGenerator)
      const iifeGeneratorExports = await import(iifeGeneratorPath)
      const iifeGeneratorFunc: IifeGeneratorFunc = iifeGeneratorExports.default

      if (typeof iifeGeneratorFunc !== 'function') {
        throw new Error('iifeGenerator must have a default function export')
      }

      const iifeGeneratorConfig = {
        pkgDir,
        entryAlias,
        log: pkgLog.bind(undefined, pkgBundleStruct.pkgJson.name),
      }
      const iifeGeneratorRes = await iifeGeneratorFunc(iifeGeneratorConfig)

      if (typeof iifeGeneratorRes !== 'string') {
        throw new Error('iifeGenerator must return a string')
      }

      const transpiledDir = joinPaths(pkgDir, transpiledSubdir)
      const transpiledPath = joinPaths(transpiledDir, entryAlias) +
        srcIifeSubextension + transpiledExtension

      contentMap[transpiledPath] = iifeGeneratorRes

      pkgBundleStruct.miscWatchPaths.push( // HACK: modify passed-in struct
        iifeGeneratorPath,
        ...(iifeGeneratorExports.getWatchPaths ?
          iifeGeneratorExports.getWatchPaths(iifeGeneratorConfig) :
          []),
      )
    }
  }

  return contentMap
}

// External Packages
// -------------------------------------------------------------------------------------------------

export function computeExternalPkgs(pkgBundleStruct: PkgBundleStruct): string[] {
  const { pkgJson } = pkgBundleStruct

  return Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.peerDependencies,
    ...pkgJson.optionalDependencies,
  })
}

/*
For IIFE, some third-party packages are bundled
*/
export function computeIifeExternalPkgs(pkgBundleStruct: PkgBundleStruct): string[] {
  const { iifeGlobalsMap } = pkgBundleStruct

  return computeExternalPkgs(pkgBundleStruct)
    .filter((pkgName) => (
      iifeGlobalsMap[pkgName] !== '' &&
      iifeGlobalsMap['*'] !== ''
    ))
}

export function splitPkgNames(
  pkgNames: string[],
  monorepoStruct: MonorepoStruct,
): { ourPkgNames: string[], theirPkgNames: string[] } {
  const ourPkgNames: string[] = []
  const theirPkgNames: string[] = []

  for (let pkgName of pkgNames) {
    if (monorepoStruct.pkgNameToDir[pkgName]) {
      ourPkgNames.push(pkgName)
    } else {
      theirPkgNames.push(pkgName)
    }
  }

  return { ourPkgNames, theirPkgNames }
}

// External File Paths
// -------------------------------------------------------------------------------------------------

export function computeOwnExternalPaths(pkgBundleStruct: PkgBundleStruct): string[] {
  return Object.values(pkgBundleStruct.entryStructMap)
    .map((entryStruct) => entryStruct.entrySrcPath)
}

export function computeOwnIifeExternalPaths(
  currentEntryStruct: EntryStruct,
  pkgBundleStruct: PkgBundleStruct,
): string[] {
  const { entryStructMap, iifeGlobalsMap } = pkgBundleStruct
  const currentGlobalName = iifeGlobalsMap[currentEntryStruct.entryGlob]

  const iifeEntryStructMap = filterProps(entryStructMap, (entryStruct) => {
    const globalName = iifeGlobalsMap[entryStruct.entryGlob]

    return Boolean(
      // not the current entrypoint
      entryStruct.entryGlob !== currentEntryStruct.entryGlob &&
      // has a global variable
      globalName &&
      // not nested within current global variable
      (!currentGlobalName || !globalName.startsWith(currentGlobalName + '.')),
    )
  })

  return Object.values(iifeEntryStructMap)
    .map((entryStruct) => entryStruct.entrySrcPath)
}

// IIFE Browser Globals
// -------------------------------------------------------------------------------------------------

export function computeIifeGlobals(
  pkgBundleStruct: PkgBundleStruct,
  monorepoStruct: MonorepoStruct,
): IifeGlobalsMap {
  const allGlobalsMap: IifeGlobalsMap = {}

  const { pkgJson, entryStructMap, iifeGlobalsMap } = pkgBundleStruct
  const pkgName = pkgJson.name

  // scan the package's own unglobbed entrypoints
  for (const entryAlias in entryStructMap) {
    const { entrySrcPath, entryGlob } = entryStructMap[entryAlias]
    const globalName = iifeGlobalsMap[entryGlob]

    if (globalName) {
      const fullImportId = entryGlob === '.' ?
        pkgName :
        pkgName + '/' + entryAlias

      allGlobalsMap[fullImportId] = globalName
      allGlobalsMap[entrySrcPath] = globalName // add file path too
    }
  }

  // scan the package's external dependencies
  // TODO: scan dependencies of dependencies (or just do a global scan)
  for (const importId in iifeGlobalsMap) {
    const globalName = iifeGlobalsMap[importId]

    if (globalName) {
      if (importId !== '.' && !importId.startsWith('./')) {
        allGlobalsMap[importId] = globalName
      }
    }
  }

  const depDirs = computeLocalDepDirs(monorepoStruct, pkgJson)
  const depPkgJsons = depDirs.map((depDir) => monorepoStruct.pkgDirToJson[depDir])

  // scan the package's dependencies that live in the monorepo
  for (const depPkgJson of depPkgJsons) {
    const depPkgName = depPkgJson.name
    const depBuildConfig: PkgJsonBuildConfig = depPkgJson.buildConfig || {}
    const depIifeGlobalsMap = depBuildConfig.iifeGlobals || {}

    for (const importId in depIifeGlobalsMap) {
      const globalName = depIifeGlobalsMap[importId]

      if (globalName) {
        if (importId === '.') {
          allGlobalsMap[depPkgName] = globalName
        } else if (importId.startsWith('./')) {
          allGlobalsMap[depPkgName + importId.substring(1)] = globalName
        }
      }
    }
  }

  return allGlobalsMap
}

// Utils
// -------------------------------------------------------------------------------------------------

function removeDotSlash(path: string): string {
  return path.replace(/^\.\//, '')
}
