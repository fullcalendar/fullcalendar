import { writeDistPkgJsons } from './json.ts'
import { deleteBuiltFiles } from './pkg/build.ts'
import { watchBundles } from './pkg/bundle.ts'
import { resolveBuildConfig, type PkgJsonBuildConfig } from './pkg/utils/bundle-struct.ts'
import {
  type MonorepoStruct,
  type PkgStruct,
  traverseMonorepo,
  watchMonorepo,
} from './utils/monorepo-struct.ts'
import { watchTs } from './utils/monorepo-ts.ts'
import { untilSigInt } from './utils/process.ts'
import { type ScriptContext } from './utils/script-runner.ts'

// TODO: if error with rollup, kill typescript, and vice-versa

export default async function(this: ScriptContext) {
  const monorepoDir = this.cwd
  const initialMonorepoStruct = this.monorepoStruct

  async function handleMonorepo(monorepoStruct: MonorepoStruct) {
    // Clear previous bundles
    // TODO: have watchBundles/writeBundles do this automatically
    // (but don't clear package.json)
    await traverseMonorepo(monorepoStruct, async (pkgStruct: PkgStruct) => {
      const { pkgDir, pkgJson } = pkgStruct

      if (pkgJson.buildConfig) {
        await deleteBuiltFiles(pkgDir)
      }
    })

    await writeDistPkgJsons(monorepoStruct, true) // isDev=true

    // tsc needs tsconfig.json and package.json from above
    const stopTs = await watchTs(monorepoDir, ['--pretty', '--preserveWatchOutput'])

    const stopPkgs = await traverseMonorepo(monorepoStruct, async (pkgStruct: PkgStruct) => {
      const { pkgDir, pkgJson } = pkgStruct
      const buildConfig = await resolveBuildConfig(pkgDir, pkgJson.buildConfig)

      if (buildConfig && !buildConfig.disableWatch) {
        return watchBundles(pkgDir, pkgJson, true) // isDev=true
      }
    })

    return () => { // a "stop" function
      stopTs()
      stopPkgs()
    }
  }

  const stopMonorepo = await watchMonorepo(
    monorepoDir,
    handleMonorepo,
    initialMonorepoStruct,
  )

  await untilSigInt()
  stopMonorepo()
}
