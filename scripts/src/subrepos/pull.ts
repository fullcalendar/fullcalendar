import { pullSubrepo, querySubrepoSubdirs } from '../utils/git-subrepo.js'
import { ScriptContext } from '../utils/script-runner.js'

export default async function(this: ScriptContext) {
  const monorepoDir = this.cwd
  const subdirs = await querySubrepoSubdirs(monorepoDir)

  for (const subdir of subdirs) {
    await pullSubrepo(monorepoDir, subdir)
  }
}
