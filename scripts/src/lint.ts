import { refineFilterArgs } from './utils/monorepo-config.js'
import { ScriptContext } from './utils/script-runner.js'
import { runTurboTasks } from './utils/turbo.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const monorepoDir = this.cwd
  const { monorepoStruct } = this

  runTurboTasks(monorepoDir, ['lint', ...refineFilterArgs(args, monorepoStruct)])
}
