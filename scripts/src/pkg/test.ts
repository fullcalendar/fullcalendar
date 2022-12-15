import { join as joinPaths } from 'path'
import karma from 'karma'
import buildKarmaConfig from '../../config/karma.js'
import { ScriptContext } from '../utils/script-runner.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const pkgDir = this.cwd
  const pkgJson = this.monorepoStruct.pkgDirToJson[pkgDir]
  const karmaConfig = pkgJson.karmaConfig

  if (!karmaConfig) {
    throw new Error('Package being tested must have karmaConfig')
  }

  // TODO: util for this
  const flagArgs: string[] = []
  const orderedArgs: string[] = []
  for (let arg of args) {
    if (arg.startsWith('-')) {
      flagArgs.push(arg)
    } else {
      orderedArgs.push(arg)
    }
  }

  const isDev = flagArgs.includes('--dev')
  const suiteConfigs = normalizeSuites(karmaConfig)
  const suiteNames = orderedArgs.length ?
    orderedArgs :
    (isDev ? ['default'] : Object.keys(suiteConfigs))

  for (const suiteName of suiteNames) {
    const suiteConfig = suiteConfigs[suiteName]
    const server = await createKarmaServer(
      pkgDir,
      suiteConfig.files,
      isDev,
      flagArgs,
    )

    server.start()

    if (!isDev) {
      await untilKarmaSuccess(server)
    }
  }
}

// Config
// -------------------------------------------------------------------------------------------------

type SuiteConfigMap = { [suiteName: string]: SuiteConfig }

interface SuiteConfig {
  files: string[]
}

function normalizeSuites(karmaConfig: any): SuiteConfigMap {
  const suites = { ...karmaConfig.suites }

  if (karmaConfig.files) {
    suites.default = { files: karmaConfig.files }
  }

  return suites
}

// Karma Server
// -------------------------------------------------------------------------------------------------

async function createKarmaServer(
  pkgDir: string,
  filePaths: string[],
  isDev: boolean,
  cliArgs: string[],
): Promise<karma.Server> {
  const absPaths = filePaths.map((filePath) => joinPaths(pkgDir, filePath))

  // karma JS API: https://karma-runner.github.io/6.4/dev/public-api.html
  const parsedConfig = await karma.config.parseConfig(
    undefined,
    buildKarmaConfig(absPaths, isDev, cliArgs),
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

function untilKarmaSuccess(server: karma.Server): Promise<void> {
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
