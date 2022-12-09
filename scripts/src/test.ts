import chalk from 'chalk'
import { ScriptContext } from './utils/script-runner.js'
import { execLive } from './utils/exec.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const isDev = args.includes('--dev')
  const isAll = args.includes('--all')
  const isOther = args.includes('--other')
  const { monorepoStruct } = this
  const { pkgDirToJson } = monorepoStruct
  const promises: Promise<any>[] = []

  for (const pkgDir in pkgDirToJson) {
    const pkgJson = pkgDirToJson[pkgDir]

    if (
      isAll ||
      (isOther && !pkgJson.karmaConfig) ||
      (!isOther && pkgJson.karmaConfig)
    ) {
      const subcommand = isDev ? 'test:dev' : 'test'

      if (pkgJson.scripts?.[subcommand]) {
        console.log()
        console.log(chalk.green(pkgJson.name))
        console.log()

        const promise = execLive(['pnpm', 'run', subcommand], { cwd: pkgDir })

        if (isDev) {
          promises.push(promise)
        } else {
          await promise
        }
      }
    }
  }

  await Promise.all(promises)
}
