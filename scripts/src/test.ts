import chalk from 'chalk'
import { ScriptContext } from './utils/script-runner.js'
import { execLive } from './utils/exec.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const isDev = args.includes('--dev')
  const isAll = args.includes('--all')
  const { monorepoStruct } = this
  const { pkgDirToJson } = monorepoStruct
  const promises: Promise<any>[] = []

  for (const pkgDir in pkgDirToJson) {
    const pkgJson = pkgDirToJson[pkgDir]

    if (isAll || pkgJson.karmaConfig) {
      if (isDev) {
        if (pkgJson.karmaConfig) {
          promises.push(
            execLive(['pnpm', 'run', 'test:dev'], { cwd: pkgDir }),
          )
        }
      } else {
        console.log()
        console.log(chalk.green(pkgJson.name))
        console.log()

        await execLive(['pnpm', 'run', 'test'], { cwd: pkgDir })
      }
    }
  }

  await Promise.all(promises)
}
