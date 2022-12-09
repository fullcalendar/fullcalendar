import { join as joinPaths } from 'path'
import { fileExists } from './utils/fs.js'
import { ScriptContext } from './utils/script-runner.js'
import { MonorepoStruct, PkgStruct, traverseMonorepoGreedy  } from './utils/monorepo-struct.js'
import { writeDistPkgJson } from './pkg/json.js'

export default async function(this: ScriptContext, ...args: string[]) {
  const isDev = args.includes('--dev')

  await writeDistPkgJsons(this.monorepoStruct, isDev)
}

export function writeDistPkgJsons(
  monorepoStruct: MonorepoStruct,
  isDev: boolean,
  reuseExisting = false,
) {
  return traverseMonorepoGreedy(monorepoStruct, async (pkgStruct: PkgStruct) => {
    const { pkgDir, pkgJson } = pkgStruct

    if (pkgJson.buildConfig) {
      if (
        !reuseExisting ||
        !(await fileExists(joinPaths(pkgDir, 'dist/package.json')))
      ) {
        await writeDistPkgJson(pkgDir, pkgJson, isDev)
      }
    }
  })
}
