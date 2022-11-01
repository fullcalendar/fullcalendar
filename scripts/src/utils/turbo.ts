import { join as joinPaths } from 'path'
import { execLive } from './exec.js'
import { standardScriptsDir } from './script-runner.js'

export function runTurboTasks(monorepoDir: string, turboRunArgs: string[]): Promise<void> {
  return execLive([
    joinPaths(standardScriptsDir, 'node_modules/.bin/turbo'),
    'run', ...turboRunArgs,
  ], {
    cwd: monorepoDir,
  })
}
