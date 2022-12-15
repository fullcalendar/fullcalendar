import { ScriptContext } from './utils/script-runner.js'
import { writeTsconfigs } from './utils/monorepo-ts.js'
import { writeDistPkgJsons } from './json.js'

export default async function(this: ScriptContext) {
  await Promise.all([
    writeTsconfigs(this.monorepoStruct),
    writeDistPkgJsons(
      this.monorepoStruct,
      true, // isDev
      true, // reuseExisting
    ),
  ])
}
