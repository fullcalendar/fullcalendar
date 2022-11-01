import { join as joinPaths, basename } from 'path'

export interface PkgAnalysis {
  metaRootDir: string // where LICENSE lives
  pkgDir: string
  isBundle: boolean
  isTests: boolean
}

export function analyzePkg(pkgDir: string): PkgAnalysis {
  const pkgDirName = basename(pkgDir)
  const isTests = pkgDirName === 'tests'
  const isBundle = pkgDirName === 'bundle'
  const metaRootDir = joinPaths(pkgDir, (isTests || isBundle) ? '..' : '../..')

  return {
    metaRootDir,
    pkgDir,
    isTests,
    isBundle,
  }
}
