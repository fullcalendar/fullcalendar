import { join as joinPaths } from 'path'
import { execLive, spawnLive } from './exec.ts'
import { standardScriptsDir } from './script-runner.ts'
import { log } from './log.ts'

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
