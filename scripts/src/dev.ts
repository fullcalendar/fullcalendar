import { writeDistPkgJsons } from './json.js'
import { deleteBuiltFiles } from './pkg/build.js'
import { watchBundles } from './pkg/bundle.js'
import {
  MonorepoStruct,
  PkgStruct,
  traverseMonorepo,
  watchMonorepo,
} from './utils/monorepo-struct.js'
import { watchTs, writeTsconfigs } from './utils/monorepo-ts.js'
import { untilSigInt } from './utils/process.js'
import { ScriptContext } from './utils/script-runner.js'

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

    await writeTsconfigs(monorepoStruct)
    await writeDistPkgJsons(monorepoStruct, true) // isDev=true

    // tsc needs tsconfig.json and package.json from above
    const stopTs = await watchTs(monorepoDir, ['--pretty', '--preserveWatchOutput'])

    const stopPkgs = await traverseMonorepo(monorepoStruct, async (pkgStruct: PkgStruct) => {
      const { pkgDir, pkgJson } = pkgStruct

      if (pkgJson.buildConfig) {
        return watchBundles(pkgDir, pkgJson, monorepoStruct, true) // isDev=true
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
