import { join as joinPaths } from 'path'
import { execLive } from './exec.ts'
import { standardScriptsDir } from './script-runner.ts'

export function runTurboTasks(monorepoDir: string, turboRunArgs: string[]): Promise<void> {
  return execLive([
    joinPaths(standardScriptsDir, 'node_modules/.bin/turbo'),
    'run', ...turboRunArgs,
  ], {
    cwd: monorepoDir,
  })
}
