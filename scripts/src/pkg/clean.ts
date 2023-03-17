import { join as joinPaths } from 'path'
import { rm } from 'fs/promises'
import { ScriptContext } from '../utils/script-runner.js'

const pathsToDelete = [
  './dist',
  './tsconfig.json',
  './tsconfig.tsbuildinfo', // for when pkg transpiles directly into dist
  './.turbo',
]

export default async function(this: ScriptContext) {
  const pkgDir = this.cwd

  await cleanPkg(pkgDir)
}

export async function cleanPkg(pkgDir: string): Promise<void> {
  await Promise.all(
    pathsToDelete.map((path) => {
      return rm(
        joinPaths(pkgDir, path),
        { force: true, recursive: true },
      )
    }),
  )
}
