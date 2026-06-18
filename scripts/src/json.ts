import { join as joinPaths } from 'path'
import { fileExists } from './utils/fs.ts'
import { type ScriptContext } from './utils/script-runner.ts'
import { type MonorepoStruct, type PkgStruct, traverseMonorepoGreedy  } from './utils/monorepo-struct.ts'
import { writeDistPkgJson } from './pkg/json.ts'

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
