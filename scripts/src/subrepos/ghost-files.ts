import { join as joinPaths } from 'path'
import { readFile, writeFile, copyFile, rm } from 'fs/promises'
import { monorepoDir } from '../utils/script-runner.js'
import {
  addFile,
  assumeUnchanged,
  checkoutFile,
  commitDir,
  isStaged,
} from '../utils/git.js'
import { boolPromise } from '../utils/lang.js'
import { querySubrepoSubdirs } from '../utils/git-subrepo.js'

// config
import ghostFileConfigMap, { GhostFileConfig } from '../../config/ghost-files.js'

export default async function(...args: string[]) {
  await updateGhostFiles(
    monorepoDir,
    await querySubrepoSubdirs(monorepoDir),
    args.includes('--no-commit'),
  )
}

export async function updateGhostFiles(
  monorepoDir: string,
  subdirs: string[] = [],
  doCommit = true,
) {
  const ghostFilePaths = getGhostFilePaths(monorepoDir, subdirs)

  await revealFiles(ghostFilePaths)
  await writeFiles(monorepoDir, subdirs)
  const anyAdded = await addFiles(ghostFilePaths)

  if (anyAdded && doCommit) {
    await commitDir(monorepoDir, 'subrepo meta file changes')
  }

  // if not committed, files will be seen as staged, even after hiding them
  await hideFiles(ghostFilePaths)
}

function getGhostFilePaths(monorepoDir: string, subdirs: string[]): string[] {
  const ghostFileSubpaths = Object.keys(ghostFileConfigMap)
  const paths: string[] = []

  for (const subdir of subdirs) {
    for (const ghostFilePath of ghostFileSubpaths) {
      paths.push(joinPaths(monorepoDir, subdir, ghostFilePath))
    }
  }

  return paths
}

// Generation
// -------------------------------------------------------------------------------------------------

async function writeFiles(monorepoDir: string, subdirs: string[]) {
  await Promise.all(
    subdirs.map((subdir) => writeSubdirFiles(monorepoDir, subdir)),
  )
}

async function writeSubdirFiles(monorepoDir: string, subdir: string): Promise<void> {
  await Promise.all(
    Object.keys(ghostFileConfigMap).map(async (ghostFileSubpath) => {
      const ghostFileConfig = ghostFileConfigMap[ghostFileSubpath]
      await writeSubdirFile(monorepoDir, subdir, ghostFileSubpath, ghostFileConfig)
    }),
  )
}

async function writeSubdirFile(
  monorepoDir: string,
  subdir: string,
  ghostFileSubpath: string,
  ghostFileConfig: GhostFileConfig,
): Promise<void> {
  if (ghostFileConfig.generator) {
    const readOrig = () => readFile(joinPaths(monorepoDir, ghostFileSubpath), 'utf8')
    const res = await ghostFileConfig.generator(readOrig, monorepoDir, subdir)

    if (typeof res === 'string') {
      await writeFile(joinPaths(monorepoDir, subdir, ghostFileSubpath), res)
    }
  } else {
    await copyFile(
      joinPaths(monorepoDir, ghostFileSubpath),
      joinPaths(monorepoDir, subdir, ghostFileSubpath),
    )
  }
}

// Git utils
// -------------------------------------------------------------------------------------------------

async function revealFiles(paths: string[]): Promise<void> {
  for (let path of paths) {
    const inIndex = await boolPromise(assumeUnchanged(path, false))
    if (inIndex) {
      await checkoutFile(path)
    }
  }
}

async function addFiles(paths: string[]): Promise<boolean> {
  let anyAdded = false

  for (let path of paths) {
    await addFile(path)

    if (await isStaged(path)) {
      anyAdded = true
    }
  }

  return anyAdded
}

async function hideFiles(paths: string[]): Promise<void> {
  for (let path of paths) {
    const inIndex = await boolPromise(assumeUnchanged(path, true))
    if (inIndex) {
      await rm(path, { force: true })
    }
  }
}
