import { join as joinPaths, dirname } from 'path'
import { readFile } from 'fs/promises'
import { watch as watchPaths } from 'chokidar'
import { globby } from 'globby'
import * as semver from 'semver'
import * as yaml from 'js-yaml'
import { getPkgJsonPath, readPkgJson } from './pkg-json.js'
import { continuousAsync, ContinuousAsyncFuncRes } from './lang.js'

export interface MonorepoStruct {
  monorepoDir: string
  monorepoPkgJson: any
  monorepoConfigPath: string
  pkgNameToDir: { [name: string]: string }
  pkgDirToJson: { [dir: string]: any }
}

export interface PkgStruct { // only for traversing
  pkgDir: string
  pkgJson: any
  localDepDirs: string[]
}

export async function watchMonorepo(
  monorepoDir: string,
  handleMonorepo: (monorepoStruct: MonorepoStruct) => ContinuousAsyncFuncRes,
  initialMonorepoStruct?: MonorepoStruct,
): Promise<() => void> {
  return continuousAsync(async (rerun) => {
    const monorepoStruct = initialMonorepoStruct || (await readMonorepo(monorepoDir))
    initialMonorepoStruct = undefined

    const relevantPaths = getMonorepoRelevantPaths(monorepoStruct)
    const watcher = watchPaths(relevantPaths, { ignoreInitial: true })
    watcher.once('all', rerun)

    const cleanupFunc = await handleMonorepo(monorepoStruct)

    return () => {
      watcher.close()
      cleanupFunc && cleanupFunc()
    }
  })
}

/*
Like traverseMonorepo, but handlers will not delay traversal of dependents
*/
export async function traverseMonorepoGreedy(
  monorepoStruct: MonorepoStruct,
  handlePkg: (pkgStruct: PkgStruct) => (Promise<void> | void),
  startPkgDir: string = '',
) {
  const promises: Promise<void>[] = []

  await traverseMonorepo(
    monorepoStruct,
    (pkgStruct: PkgStruct) => {
      const promise = handlePkg(pkgStruct)
      if (promise) {
        promises.push(promise)
      }
    },
    startPkgDir,
  )

  await Promise.all(promises)
}

export async function traverseMonorepo(
  monorepoStruct: MonorepoStruct,
  handlePkg: (pkgStruct: PkgStruct) => ContinuousAsyncFuncRes,
  startPkgDir: string = '',
): Promise<() => void> {
  const { pkgDirToJson } = monorepoStruct
  const promiseMap: { [pkgDir: string]: Promise<void> } = {}
  const cleanupFuncs: (() => void)[] = []

  if (startPkgDir) {
    await traversePkg(startPkgDir)
  } else {
    await Promise.all(
      Object.keys(pkgDirToJson).map((pkgDir) => traversePkg(pkgDir)),
    )
  }

  return () => {
    for (let cleanupFunc of cleanupFuncs) {
      cleanupFunc()
    }
  }

  function traversePkg(pkgDir: string): Promise<void> {
    return (promiseMap[pkgDir] || (promiseMap[pkgDir] = (async function() {
      const pkgJson = pkgDirToJson[pkgDir]
      if (!pkgJson) {
        throw new Error(`Unknown package at '${pkgDir}'`)
      }

      const localDepDirs = computeLocalDepDirs(monorepoStruct, pkgJson)
      await Promise.all(
        localDepDirs.map((localDepDir) => traversePkg(localDepDir)),
      )

      const cleanupFunc = await handlePkg({
        pkgDir,
        pkgJson,
        localDepDirs,
      })

      if (cleanupFunc) {
        cleanupFuncs.push(cleanupFunc)
      }
    })()))
  }
}

export function computeLocalDepDirs(monorepoStruct: MonorepoStruct, pkgJson: any): string[] {
  const { pkgNameToDir, pkgDirToJson } = monorepoStruct
  const depMap = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
  const localDepDirs: string[] = []

  for (let depName in depMap) {
    const depSpecifier = depMap[depName]

    // TODO: workspace protocol accepts directory too
    const localDepMatch = depSpecifier.match(/^workspace:(.*)$/)
    const depVersionRange = localDepMatch ? localDepMatch[1] : depSpecifier

    const depDir = pkgNameToDir[depName]
    const depJsonObj = pkgDirToJson[depDir]

    if (depJsonObj && (
      depVersionRange === '*' || // workaround for '*' not matching prerelease tags
      semver.satisfies(depJsonObj.version, depVersionRange)
    )) {
      localDepDirs.push(depDir)
    } else if (localDepMatch) {
      throw new Error(
        `Workspace package '${depName}@${depJsonObj.version}' ` +
        `does not match '${depSpecifier}'`,
      )
    }
  }

  return localDepDirs
}

export async function readMonorepo(monorepoDir: string): Promise<MonorepoStruct> {
  const { monorepoPkgJson, monorepoConfigPath, pkgDirGlobs } = await getMonorepoMeta(monorepoDir)
  const pkgDirs = await expandMonorepoPkgDirGlobs(monorepoDir, pkgDirGlobs)

  const pkgJsonObjs = await Promise.all(
    pkgDirs.map((pkgDir) => readPkgJson(pkgDir)),
  )

  const pkgNameToDir: { [name: string]: string } = {}
  const pkgDirToJson: { [name: string]: any } = {}

  for (let i = 0; i < pkgJsonObjs.length; i++) {
    const pkgJson = pkgJsonObjs[i]
    const pkgName = pkgJson.name
    const pkgDir = pkgDirs[i]

    if (!pkgName) {
      throw new Error(`Package '${pkgDir}' must have a name`)
    }

    if (!pkgJson.version) {
      throw new Error(`Package '${pkgDir}' must have a version`)
    }

    pkgNameToDir[pkgName] = pkgDir
    pkgDirToJson[pkgDir] = pkgJson
  }

  return { monorepoPkgJson, monorepoConfigPath, monorepoDir, pkgNameToDir, pkgDirToJson }
}

async function getMonorepoMeta(monorepoDir: string): Promise<{
  monorepoPkgJson: any,
  monorepoConfigPath: string,
  pkgDirGlobs: string[],
}> {
  const monorepoPkgJson = await readPkgJson(monorepoDir)
  const pnpmWorkspaceConfigPath = joinPaths(monorepoDir, 'pnpm-workspace.yaml')
  const pnpmWorkspaceConfig = await readFile(pnpmWorkspaceConfigPath, 'utf8').then(
    (str) => yaml.load(str) as any,
    () => false,
  )

  let monorepoConfigPath: string
  let pkgDirGlobs: string[]

  if (pnpmWorkspaceConfig) {
    monorepoConfigPath = pnpmWorkspaceConfigPath
    pkgDirGlobs = pnpmWorkspaceConfig.packages
  } else {
    monorepoConfigPath = getPkgJsonPath(monorepoDir)
    pkgDirGlobs = monorepoPkgJson
  }

  if (!pkgDirGlobs) {
    throw new Error(`${monorepoDir} does not appear to be a monorepo`)
  }

  return { monorepoPkgJson, monorepoConfigPath, pkgDirGlobs }
}

async function expandMonorepoPkgDirGlobs(
  monorepoDir: string,
  pkgDirGlobs: string[],
): Promise<string[]> {
  const relJsonPaths = await globby(
    pkgDirGlobs.map((pkgDirGlob) => getPkgJsonPath(pkgDirGlob)),
    { cwd: monorepoDir },
  )

  const pkgDirs = relJsonPaths.map(
    (relJsonPath) => joinPaths(monorepoDir, dirname(relJsonPath)),
  )

  return pkgDirs
}

function getMonorepoRelevantPaths(monorepoStruct: MonorepoStruct): string[] {
  const relevantPaths = [monorepoStruct.monorepoConfigPath]

  for (const pkgDir in monorepoStruct.pkgDirToJson) {
    relevantPaths.push(getPkgJsonPath(pkgDir))
  }

  return relevantPaths
}
