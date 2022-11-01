import chalk from 'chalk'
import { ScriptContext } from './utils/script-runner.js'
import { createKarmaServer, untilKarmaSuccess } from './pkg/test.js'
import { wait } from './utils/lang.js'
import { execLive } from './utils/exec.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const isAll = args.includes('--all')
  const isDev = args.includes('--dev')
  const { monorepoStruct } = this
  const { pkgDirToJson } = monorepoStruct

  for (const pkgDir in pkgDirToJson) {
    const pkgJson = pkgDirToJson[pkgDir]
    const isKarma = Boolean(pkgJson.karmaConfig)
    const isOther = Boolean(pkgJson.scripts?.test) && isAll && !isDev

    if (isKarma || isOther) {
      console.log()
      console.log(chalk.green(pkgJson.name))
      console.log()
    }

    if (isKarma) {
      const server = await createKarmaServer({ pkgDir, pkgJson, isDev, cliArgs: args })

      if (!isDev) {
        server.start()
        await untilKarmaSuccess(server)
      } else {
        await server.start()
        await wait(100) // let logging flush
      }
    } else if (isOther) {
      await execLive(['pnpm', 'run', 'test'], { cwd: pkgDir })
    }
  }

  // TODO: for isDev, await sigint?
}
