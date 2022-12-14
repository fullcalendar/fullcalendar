import { dirname } from 'path'
import { SpawnError, execSilent, execLive } from './exec.js'

export function assumeUnchanged(path: string, toggle = true): Promise<void> {
  return execSilent([
    'git', 'update-index',
    toggle ? '--assume-unchanged' : '--no-assume-unchanged',
    path,
  ], {
    cwd: dirname(path),
  })
}

export function checkoutFile(path: string): Promise<void> {
  return execSilent([
    'git', 'checkout', '--', path,
  ], {
    cwd: dirname(path),
  })
}

export function addFile(path: string): Promise<void> {
  return execSilent([
    'git', 'add', path,
  ], {
    cwd: dirname(path),
  })
}

export function commitDir(dir: string, message: string): Promise<void> {
  return execLive([
    'git', 'commit', '-m', message,
  ], {
    cwd: dir,
  })
}

export function isStaged(path: string): Promise<boolean> {
  return execSilent([
    'git', 'diff', '--quiet', '--staged', path, // implies --exit-code
  ], {
    cwd: dirname(path),
  }).then(
    () => false, // 0 exitCode means no difference
    (error: SpawnError) => error.exitCode === 1, // 1 exitCode means difference
  )
}
