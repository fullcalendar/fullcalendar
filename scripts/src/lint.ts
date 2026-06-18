import { refineFilterArgs } from './utils/monorepo-config.ts'
import { ScriptContext } from './utils/script-runner.ts'
import { runTurboTasks } from './utils/turbo.ts'

export default async function(this: ScriptContext, ...args: string[]) {
  const monorepoDir = this.cwd
  const { monorepoStruct } = this

  runTurboTasks(monorepoDir, ['lint', ...refineFilterArgs(args, monorepoStruct)])
}
