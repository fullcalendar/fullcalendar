import { execCapture, execLive } from './exec.js'

export async function querySubrepoSubdirs(monorepoDir: string): Promise<string[]> {
  const s = await execCapture([
    'git', 'subrepo', 'status', '--quiet',
  ], {
    cwd: monorepoDir,
  })
  return s.trim().split('\n')
}

export function pullSubrepo(monorepoDir: string, subdir: string): Promise<void> {
  return execLive([
    'git', 'subrepo', 'pull', subdir,
  ], {
    cwd: monorepoDir,
  })
}

export async function pushSubrepo(monorepoDir: string, subdir: string): Promise<void> {
  await execLive([
    'git', 'subrepo', 'push', subdir,
  ], {
    cwd: monorepoDir,
  })

  // clean temporary "worktrees" that prevent other operations from happening
  await execLive([
    'git', 'subrepo', 'clean', subdir,
  ], {
    cwd: monorepoDir,
  })
}
