import { join as joinPaths, relative as relativizePath } from 'path'
import { mkdir } from 'fs/promises'
import { analyzePkg } from '../utils/pkg-analysis.js'
import { readPkgJson, writePkgJson } from '../utils/pkg-json.js'
import { mapProps } from '../utils/lang.js'
import { ScriptContext } from '../utils/script-runner.js'
import { cjsExtension, esmExtension, iifeSubextension } from './utils/config.js'
import { EntryConfig } from './utils/bundle-struct.js'

const cdnFields = [
  'unpkg',
  'jsdelvr',
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
  const typesRoot = isDev ? './.tsout' : '.'

  const entryConfigMap = buildConfig.exports
  const exportsMap: any = {
    './package.json': './package.json',
  }

  for (const entryName in entryConfigMap) {
    const entryConfig = entryConfigMap[entryName]
    const entrySubpath = entryName === '.' ? './index' : entryName

    // inter-package imports in bundled js use explicit extensions to avoid format confusion
    exportsMap[entrySubpath + cjsExtension] = entrySubpath + cjsExtension
    exportsMap[entrySubpath + esmExtension] = entrySubpath + esmExtension

    exportsMap[entryName] = {
      require: entrySubpath + cjsExtension,
      import: entrySubpath + esmExtension,
      types: entrySubpath.replace(/^\./, typesRoot) + '.d.ts',
    }

    if (entryConfig.iife) {
      exportsMap[entryName].default = entrySubpath + iifeSubextension + '.js'
    }
  }

  const finalPkgJson = {
    ...basePkgJson,
    ...pkgJson,
    main: './index' + cjsExtension,
    module: './index' + esmExtension,
    types: `${typesRoot}/index.d.ts`,
    ...cdnFields.reduce(
      (props, cdnField) => Object.assign(props, {
        [cdnField]: './index' + iifeSubextension + '.min.js',
      }),
      {},
    ),
    exports: exportsMap,
  }

  delete finalPkgJson.scripts
  delete finalPkgJson.devDependencies
  delete finalPkgJson.tsConfig
  delete finalPkgJson.buildConfig
  delete finalPkgJson.publishConfig
  delete finalPkgJson.private
  delete finalPkgJson.pnpm
  delete finalPkgJson.engines

  finalPkgJson.repository.directory = relativizePath(pkgAnalysis.metaRootDir, pkgDir)

  const distDir = joinPaths(pkgDir, 'dist')
  await mkdir(distDir, { recursive: true })
  await writePkgJson(distDir, finalPkgJson)
}
