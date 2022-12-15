import { join as joinPaths, sep as pathSep } from 'path'
import { fileURLToPath } from 'url'
import { fileExists } from './fs.js'
import { MonorepoStruct, readMonorepo } from './monorepo-struct.js'
// import { compileTs, writeTsconfigs } from './monorepo-ts.js'

export interface ScriptContext {
  cwd: string
  monorepoStruct: MonorepoStruct
  scriptName: string
}

export const standardScriptsDir = joinPaths(fileURLToPath(import.meta.url), '../../..')

export async function runScript(scriptPkgDir: string): Promise<void> {
  const cwd = process.cwd()
  const scriptName = process.argv[2]
  const scriptArgs = process.argv.slice(3)

  if (!scriptName) {
    throw new Error('Must provide a script name')
  }

  const monorepoDir = await findNearestMonorepoRoot(cwd)
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
    cwd,
    monorepoStruct,
    scriptName,
  }

  await scriptMain.apply(scriptContext, scriptArgs)
}

// TODO: cleanup
async function findNearestMonorepoRoot(currentDir: string): Promise<string> {
  const parts = currentDir.split(pathSep)

  while (parts.length) {
    const dir = parts.join(pathSep)

    if (await fileExists(joinPaths(dir, 'pnpm-workspace.yaml'))) {
      return dir
    }

    parts.pop()
  }

  return ''
}
