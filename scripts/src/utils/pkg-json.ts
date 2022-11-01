import { join as joinPaths } from 'path'
import { readJson, writeJson } from './fs.js'

export function readPkgJson(pkgDir: string): Promise<any> {
  return readJson(getPkgJsonPath(pkgDir))
}

export async function writePkgJson(pkgDir: string, pkgJson: any): Promise<any> {
  return writeJson(getPkgJsonPath(pkgDir), pkgJson)
}

export function getPkgJsonPath(pkgDir: string): string {
  return joinPaths(pkgDir, 'package.json')
}
