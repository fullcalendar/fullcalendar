import { join as joinPaths, relative as relativizePath } from 'path'
import { mkdir } from 'fs/promises'
import { analyzePkg } from '../utils/pkg-analysis.ts'
import { readPkgJson, writePkgJson } from '../utils/pkg-json.ts'
import { type ScriptContext } from '../utils/script-runner.ts'
import { esmExtension, iifeExtension } from './utils/config.ts'
import { buildEntryDistAlias, resolveBuildConfig, type PkgJsonBuildConfig } from './utils/bundle-struct.ts'

const cdnFields = [
  'unpkg',
  'jsdelivr',
]

export default async function(this: ScriptContext, ...args: string[]) {
  const isDev = args.includes('--dev')
  const pkgDir = this.cwd
  const pkgJson = this.monorepoStruct.pkgDirToJson[pkgDir]

  await writeDistPkgJson(pkgDir, pkgJson, isDev)
}

/*
Ensures the dist directory is created
*/
export async function writeDistPkgJson(
  pkgDir: string,
  pkgJson: any,
  isDev: boolean,
): Promise<void> {
  const buildConfig = await resolveBuildConfig(pkgDir, pkgJson.buildConfig)
  if (!buildConfig) {
    throw new Error('Can only generate dist package.json for a buildConfig')
  }

  const pkgAnalysis = analyzePkg(pkgDir)
  const basePkgJson = await readPkgJson(pkgAnalysis.metaRootDir)
  const typesRoot = isDev ? './.tsout' : '.' // TODO: make config var for .tsout?

  const entryConfigMap = buildConfig.exports || {}
  const exportsMap: any = {
    './package.json': './package.json',
  }

  let cssExtract = buildConfig.moduleConfig?.cssExtract
  if (cssExtract) {
    exportsMap[`./${cssExtract}`] = `./${cssExtract}`
  }

  cssExtract = buildConfig.globalConfig?.cssExtract
  if (cssExtract) {
    exportsMap[`./${cssExtract}`] = `./${cssExtract}`
  }

  const sideEffects: string[] = []
  let firstCdnPath: string | undefined
  let anyCss = false

  for (const entryName in entryConfigMap) {
    const entryConfig = entryConfigMap[entryName]
    const entrySubpath = entryName === '.' ? './index' : entryName
    const entryAlias = entryName.replace(/^\.\/?/, '') || 'index'
    const entryDistAlias = buildEntryDistAlias(entryAlias, entryName, entryConfig)
    const entryDistSubpath = `./${entryDistAlias}`

    if (entryConfig.format === 'module') {
      const esmPath = entryDistSubpath + esmExtension

      const typesPath =
        isDev
          ? entryConfig.src
            ? typesRoot + '/' + entryConfig.src + '.d.ts'
            : entryConfig.types
              ? typesRoot + '/' + entryConfig.types + '.d.ts'
              : entrySubpath.replace(/^\./, typesRoot) + '.d.ts'
          : entryConfig.dist
            ? typesRoot + '/' + entryDistAlias + '.d.ts'
            : entryConfig.types
              ? typesRoot + '/' + entryConfig.types + '.d.ts'
              : entrySubpath.replace(/^\./, typesRoot) + '.d.ts'

      exportsMap[entryName] = {
        types: typesPath,
        default: esmPath,
      }

      if (entryConfig.sideEffects) {
        sideEffects.push(esmPath)
      }
    } else if (entryConfig.format === 'global') {
      sideEffects.push(entryDistSubpath + iifeExtension)
    } else if (entryConfig.format === 'css') {
      exportsMap[entryName] = entryName
      anyCss = true
    } else if (entryConfig.format === 'css-as-js') {
      exportsMap[entryName] = entryDistSubpath + iifeExtension
      sideEffects.push(entryDistSubpath + iifeExtension)
    }
  }

  if (anyCss) {
    sideEffects.push('**/*.css')
  }

  const finalPkgJson = {
    ...pkgJson, // hack to prefer key order of original file
    ...basePkgJson,
    ...pkgJson, // overrides base
    keywords:
      pkgJson.name.startsWith('@full-ui/') // HACK
        ? (pkgJson.keywords || basePkgJson.keywords || []) // don't merge
        : (basePkgJson.keywords || []).concat(pkgJson.keywords || []),
    types: `${typesRoot}/index.d.ts`,
    main: './index' + esmExtension,
    ...(
      firstCdnPath
        ? cdnFields.reduce(
          (props, cdnField) => Object.assign(props, {
            [cdnField]: firstCdnPath,
          }),
          {},
        )
        : {}
    ),
    exports: exportsMap,
  }

  // add typesVersions as a fallback for build systems that don't understand export maps
  if (isDev) {
    const typeVersionsEntryMap: any = {}

    // TODO: use mapProps
    for (const entryName in entryConfigMap) {
      const entryAlias = entryName.replace(/^\.\/?/, '') || 'index'

      typeVersionsEntryMap[entryAlias] = [`.tsout/${entryAlias}.d.ts`]
    }

    finalPkgJson.typesVersions = { '*': typeVersionsEntryMap }
  }

  if (pkgJson.sideEffects === undefined) {
    finalPkgJson.sideEffects = !sideEffects.length ? false : sideEffects
  }

  finalPkgJson.repository.directory =
    (basePkgJson.repository.directory ? `${basePkgJson.repository.directory}/` : '') +
    relativizePath(pkgAnalysis.metaRootDir, pkgDir)

  delete finalPkgJson.scripts
  delete finalPkgJson.devDependencies
  delete finalPkgJson.tsConfig
  delete finalPkgJson.buildConfig
  delete finalPkgJson.publishConfig
  delete finalPkgJson.private
  delete finalPkgJson.pnpm
  delete finalPkgJson.engines

  const distDir = joinPaths(pkgDir, 'dist')
  await mkdir(distDir, { recursive: true })
  await writePkgJson(distDir, finalPkgJson)
}
