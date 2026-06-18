import { type ScriptContext } from './utils/script-runner.ts'
import { writeDistPkgJsons } from './json.ts'

export default async function(this: ScriptContext) {
  await Promise.all([
    writeDistPkgJsons(
      this.monorepoStruct,
      true, // isDev
      true, // reuseExisting
    ),
  ])
}
