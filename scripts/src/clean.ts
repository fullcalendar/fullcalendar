import { join as joinPaths } from 'path'
import { rm } from 'fs/promises'
import { ScriptContext } from './utils/script-runner.js'
import { deleteMonorepoArchives } from './archive.js'
import { runTurboTasks } from './utils/turbo.js'
import { MonorepoStruct, traverseMonorepoGreedy } from './utils/monorepo-struct.js'
import { cleanPkg } from './pkg/clean.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const { monorepoStruct } = this
  const { monorepoDir } = monorepoStruct
  const isAll = args.includes('--all')

  await Promise.all([
    deleteRootDist(monorepoDir),
    deleteRootTsconfig(monorepoDir),
    deleteGlobalTurboCache(monorepoDir),
    deleteMonorepoArchives(monorepoStruct),
    isAll ?
      runTurboTasks(monorepoDir, ['clean']) :
      cleanPkgsDirectly(monorepoStruct),
  ])
}

// for deleting archives (only applies to 'standard')
function deleteRootDist(monorepoDir: string): Promise<void> {
  return rm(
    joinPaths(monorepoDir, 'dist'),
    { force: true },
  )
}

function deleteRootTsconfig(monorepoDir: string): Promise<void> {
  return rm(
    joinPaths(monorepoDir, 'tsconfig.json'),
    { force: true },
  )
}

function deleteGlobalTurboCache(monorepoDir: string): Promise<void> {
  return rm(
    joinPaths(monorepoDir, 'node_modules/.cache/turbo'),
    { force: true, recursive: true },
  )
}

function cleanPkgsDirectly(monorepoStruct: MonorepoStruct): Promise<void> {
  return traverseMonorepoGreedy(monorepoStruct, (pkgStruct) => {
    const { pkgJson } = pkgStruct

    if (
      pkgJson.buildConfig ||
      pkgJson.tsConfig
    ) {
      return cleanPkg(pkgStruct.pkgDir)
    }
  })
}
