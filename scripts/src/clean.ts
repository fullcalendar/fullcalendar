import { join as joinPaths } from 'path'
import { rm } from 'fs/promises'
import { type ScriptContext } from './utils/script-runner.ts'
import { runTurboTasks } from './utils/turbo.ts'
import { type MonorepoStruct, traverseMonorepoGreedy } from './utils/monorepo-struct.ts'
import { cleanPkg } from './pkg/clean.ts'

export default async function(this: ScriptContext, ...args: string[]) {
  const { monorepoStruct } = this
  const { monorepoDir } = monorepoStruct
  const isAll = args.includes('--all')

  await Promise.all([
    deleteRootDist(monorepoDir),
    deleteGlobalTurboCache(monorepoDir),
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
      (pkgJson.buildConfig || pkgJson.tsConfig) &&
      pkgJson.name !== '@fullcalendar-scripts/standard' // HACK. self
    ) {
      return cleanPkg(pkgStruct.pkgDir)
    }
  })
}
