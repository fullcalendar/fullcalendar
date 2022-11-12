import { join as joinPaths, relative as relativizePath } from 'path'
import { mkdir } from 'fs/promises'
import { analyzePkg } from '../utils/pkg-analysis.js'
import { readPkgJson, writePkgJson } from '../utils/pkg-json.js'
import { mapProps } from '../utils/lang.js'
import { ScriptContext } from '../utils/script-runner.js'
import { manualChunkMap } from './utils/config.js'

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

  const finalPkgJson = {
    ...basePkgJson,
    ...pkgJson,
    main: './index.cjs',
    module: './index.js',
    types: `${typesRoot}/index.d.ts`,
    ...cdnFields.reduce(
      (props, cdnField) => Object.assign(props, { [cdnField]: './index.global.min.js' }),
      {},
    ),
    exports: {
      './package.json': './package.json',
      ...mapProps(buildConfig.exports, (entryConfig, entryName) => {
        const entrySubpath = entryName === '.' ? './index' : entryName

        // TODO: don't do all formats. based on EntryConfig
        return {
          require: entrySubpath + '.cjs',
          import: entrySubpath + '.js',
          types: entrySubpath.replace(/^\./, typesRoot) + '.d.ts',
          default: entrySubpath + '.global.js',
        }
      }),
    },
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
