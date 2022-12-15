import { ScriptContext } from './utils/script-runner.js'
import { writeMonorepoArchives } from './archive.js'
import { runTurboTasks } from './utils/turbo.js'
import { refineFilterArgs } from './utils/monorepo-config.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const monorepoDir = this.cwd
  const { monorepoStruct } = this

  await runTurboTasks(monorepoDir, ['build', ...refineFilterArgs(args, monorepoStruct)])
  await writeMonorepoArchives(monorepoStruct)
}
