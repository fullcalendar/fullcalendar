import { join as joinPaths } from 'path'
import karma from 'karma'
import buildKarmaConfig from '../../config/karma.js'
import { ScriptContext } from '../utils/script-runner.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const pkgDir = this.cwd
  const pkgJson = this.monorepoStruct.pkgDirToJson[pkgDir]
  const isDev = args.includes('--dev')
  const server = await createKarmaServer({ pkgDir, pkgJson, isDev, cliArgs: args })

  server.start()

  if (!isDev) {
    await untilKarmaSuccess(server)
  }

  // TODO: for isDev, await sigint?
}

export interface PkgKarmaServerConfig {
  pkgDir: string
  pkgJson: any
  isDev: boolean,
  cliArgs: string[]
}

export async function createKarmaServer(pkgConfig: PkgKarmaServerConfig): Promise<karma.Server> {
  const { pkgDir, pkgJson } = pkgConfig

  if (!pkgJson.karmaConfig?.files) {
    throw new Error('Package being tested must have karmaConfig with files')
  }

  const relPaths: string[] = pkgJson.karmaConfig.files
  const pkgFilePaths = relPaths.map((relPath) => joinPaths(pkgDir, relPath))

  // karma JS API: https://karma-runner.github.io/6.4/dev/public-api.html
  const parsedConfig = await karma.config.parseConfig(
    undefined,
    buildKarmaConfig(pkgFilePaths, pkgConfig.isDev, pkgConfig.cliArgs),
    {
      promiseConfig: true,
      throwErrors: true,
    },
  )

  return new karma.Server(parsedConfig, (exitCode) => {
    if (exitCode !== 0) {
      process.exit(exitCode)
    }
  })
}

export function untilKarmaSuccess(server: karma.Server): Promise<void> {
  const onSigInt = () => {
    server.stop().then(() => process.exit(1))
  }

  process.on('SIGINT', onSigInt)

  return new Promise<void>((resolve, reject) => {
    server.on('run_complete', (browsers, testResults) => {
      process.off('SIGINT', onSigInt)

      if (testResults.exitCode === 0) {
        resolve()
      } else {
        process.exit(testResults.exitCode)
      }
    })
  })
}
