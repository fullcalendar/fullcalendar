import { ScriptContext } from './utils/script-runner.js'
import { MonorepoStruct, PkgStruct, traverseMonorepoGreedy  } from './utils/monorepo-struct.js'
import { writeDistPkgJson } from './pkg/json.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const isDev = args.includes('--dev')

  await writeDistPkgJsons(this.monorepoStruct, isDev)
}

export function writeDistPkgJsons(monorepoStruct: MonorepoStruct, isDev: boolean) {
  return traverseMonorepoGreedy(monorepoStruct, (pkgStruct: PkgStruct) => {
    const { pkgDir, pkgJson } = pkgStruct

    if (pkgJson.buildConfig) {
      return writeDistPkgJson(pkgDir, pkgJson, isDev)
    }
  })
}
