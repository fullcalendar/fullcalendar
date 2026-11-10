import { join as joinPaths, basename } from 'path'

export interface PkgAnalysis {
  metaRootDir: string // where LICENSE lives
  pkgDir: string
  isPublicMui: boolean // HACK
}

export function analyzePkg(pkgDir: string): PkgAnalysis {
  const pkgDirName = basename(pkgDir)
  const metaRootDir = joinPaths(pkgDir, '../..')

  const isPublicMui = pkgDirName === 'ui-mui'

  return {
    metaRootDir,
    pkgDir,
    isPublicMui,
  }
}
