import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { MonorepoStruct, readMonorepo } from './monorepo-struct.js'
// import { compileTs, writeTsconfigs } from './monorepo-ts.js'

export interface ScriptContext {
  cwd: string
  monorepoStruct: MonorepoStruct
  scriptName: string
}

export const monorepoScriptsDir = joinPaths(fileURLToPath(import.meta.url), '../../..')
export const monorepoDir = joinPaths(monorepoScriptsDir, '../..')

export async function runScript(scriptPkgDir: string): Promise<void> {
  const scriptName = process.argv[2]
  const scriptArgs = process.argv.slice(3)

  if (!scriptName) {
    throw new Error('Must provide a script name')
  }

  const monorepoStruct = await readMonorepo(monorepoDir)
  // await writeTsconfigs(monorepoStruct, scriptPkgDir)
  // await compileTs(scriptPkgDir)

  const scriptPath = joinPaths(scriptPkgDir, 'dist', scriptName.replace(':', '/') + '.js')
  const scriptExports = await import(scriptPath)
  const scriptMain = scriptExports.default

  if (typeof scriptMain !== 'function') {
    throw new Error(`Script '${scriptPath}' must export a default function`)
  }

  const scriptContext: ScriptContext = {
    cwd: process.cwd(),
    monorepoStruct,
    scriptName,
  }

  await scriptMain.apply(scriptContext, scriptArgs)
}
