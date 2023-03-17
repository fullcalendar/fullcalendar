import { join as joinPaths, relative as relativizePath } from 'path'
import { mkdir } from 'fs/promises'
import { analyzePkg } from '../utils/pkg-analysis.js'
import { readPkgJson, writePkgJson } from '../utils/pkg-json.js'
import { ScriptContext } from '../utils/script-runner.js'
import { cjsExtension, esmExtension, iifeSubextension } from './utils/config.js'

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
  const { buildConfig } = pkgJson

  if (!buildConfig) {
    throw new Error('Can only generate dist package.json for a buildConfig')
  }

  const pkgAnalysis = analyzePkg(pkgDir)
  const basePkgJson = await readPkgJson(pkgAnalysis.metaRootDir)
  const typesRoot = isDev ? './.tsout' : '.' // TODO: make config var for .tsout?

  const entryConfigMap = buildConfig.exports
  const exportsMap: any = {
    './package.json': './package.json',
  }

  for (const entryName in entryConfigMap) {
    const entrySubpath = entryName === '.' ? './index' : entryName

    // inter-package imports use explicit extensions to avoid format confusion
    exportsMap[entrySubpath + cjsExtension] = entrySubpath + cjsExtension
    exportsMap[entrySubpath + esmExtension] = entrySubpath + esmExtension

    exportsMap[entryName] = {
      types: entrySubpath.replace(/^\./, typesRoot) + '.d.ts', // tsc likes this first
      require: entrySubpath + cjsExtension,
      import: entrySubpath + esmExtension,
    }
  }

  const finalPkgJson = {
    ...pkgJson, // hack to prefer key order of original file
    ...basePkgJson,
    ...pkgJson, // overrides base
    keywords: (basePkgJson.keywords || []).concat(pkgJson.keywords || []),
    types: `${typesRoot}/index.d.ts`,
    main: './index' + cjsExtension,
    module: './index' + esmExtension,
    ...cdnFields.reduce(
      (props, cdnField) => Object.assign(props, {
        [cdnField]: './index' + iifeSubextension + '.min.js',
      }),
      {},
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

  if (
    pkgJson.sideEffects === undefined &&
    !pkgAnalysis.isTests &&
    !pkgAnalysis.isBundle
  ) {
    finalPkgJson.sideEffects = false
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
