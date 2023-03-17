import { join as joinPaths, relative as relativizePath } from 'path'
import { execLive, spawnLive } from './exec.js'
import { stringifyJson, writeIfDifferent } from './fs.js'
import { MonorepoStruct, PkgStruct, traverseMonorepoGreedy } from './monorepo-struct.js'
import { standardScriptsDir } from './script-runner.js'
import { log } from './log.js'

export async function compileTs(dir: string, tscArgs: string[] = []): Promise<void> {
  await execLive([
    joinPaths(standardScriptsDir, 'node_modules/.bin/tsc'),
    '-b',
    ...tscArgs,
  ], {
    cwd: dir,
  })
}

export async function watchTs(dir: string, tscArgs: string[] = []): Promise<() => void> {
  log('Pre-watch tsc compiling...')
  await compileTs(dir, tscArgs)

  // for watching, will compile again but will be quick
  return spawnLive([
    joinPaths(standardScriptsDir, 'node_modules/.bin/tsc'),
    '-b', '--watch',
    ...tscArgs,
  ], {
    cwd: dir,
  })
}

export async function writeTsconfigs(
  monorepoStruct: MonorepoStruct,
  startPkgDir = '',
): Promise<void> {
  const refDirs: string[] = []

  await traverseMonorepoGreedy(
    monorepoStruct,
    async (pkgStruct) => {
      if (await writePkgTsconfig(pkgStruct, monorepoStruct)) {
        refDirs.push(pkgStruct.pkgDir)
      }
    },
    startPkgDir,
  )

  if (!startPkgDir) {
    await writePkgTsconfigWithRefs(
      monorepoStruct.monorepoDir,
      refDirs,
      { files: [] },
    )
  }
}

async function writePkgTsconfig(
  pkgStruct: PkgStruct,
  monorepoStruct: MonorepoStruct,
): Promise<boolean> {
  const { pkgDir, pkgJson, localDepDirs } = pkgStruct
  const { tsConfig } = pkgJson

  if (tsConfig) {
    const refDirs: string[] = []

    for (let localDepDir of localDepDirs) {
      const depPkgJson = monorepoStruct.pkgDirToJson[localDepDir]

      if (depPkgJson.tsConfig) {
        refDirs.push(localDepDir)
      }
    }

    await writePkgTsconfigWithRefs(pkgDir, refDirs, tsConfig)
    return true
  }

  return false
}

async function writePkgTsconfigWithRefs(
  pkgDir: string,
  refDirs: string[], // gets modified in-place
  tsConfigBase: any,
): Promise<void> {
  refDirs.sort() // deterministic order

  const finalTsConfig = {
    ...tsConfigBase,
    references: [
      ...(tsConfigBase.references || []),
      ...refDirs.map((refDir) => ({
        path: relativizePath(pkgDir, refDir),
      })),
    ],
  }

  await writeIfDifferent(
    joinPaths(pkgDir, 'tsconfig.json'),
    stringifyJson(finalTsConfig),
  )
}
