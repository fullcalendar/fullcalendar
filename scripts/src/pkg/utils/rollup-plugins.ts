import {
  join as joinPaths,
  resolve as resolvePath,
  dirname,
  sep as pathSep,
  isAbsolute,
} from 'path'
import { Plugin } from 'rollup'
import { execLive } from '../../utils/exec.js'
import { strsToProps } from '../../utils/lang.js'
import { standardScriptsDir } from '../../utils/script-runner.js'

// Generated Content
// -------------------------------------------------------------------------------------------------

export function generatedContentPlugin(contentMap: { [path: string]: string }): Plugin {
  return {
    name: 'generated-content',
    resolveId(importId, importerPath) {
      const importPath = computeImportPath(importId, importerPath)

      // whitelist the import path
      if (importPath && contentMap[importPath]) {
        return { id: importPath }
      }
    },
    load(importPath) {
      return contentMap[importPath] // if undefined, fallback to normal file load
    },
  }
}

// Externalize Imports
// -------------------------------------------------------------------------------------------------

export interface ExteralizePathsOptions {
  paths: string[]
  extensions?: ExtensionInput
}

export function externalizePathsPlugin(options: ExteralizePathsOptions): Plugin {
  const pathMap = strsToProps(options.paths)
  const extensionMap = options.extensions && normalizeExtensionMap(options.extensions)

  return {
    name: 'externalize-paths',
    resolveId(importId, importerPath) {
      let importPath = computeImportPath(importId, importerPath)

      if (importPath && pathMap[importPath]) {
        if (extensionMap) {
          importPath = findAndReplaceExtensions(importPath, extensionMap)
        }

        if (importPath) {
          // always return the absolute path. a stable reference to the external file allows for:
          // - iife globals
          // - outputting multiple modules with code-splitting
          // (rollup will ultimately relativize the path)
          return { id: importPath, external: true }
        }
      }
    },
  }
}

export function externalizePkgsPlugin(pkgNames: string[]): Plugin {
  return {
    name: 'externalize-pkgs',
    resolveId(importId) {
      if (!isImportRelative(importId)) {
        for (const pkgName of pkgNames) {
          if (importId === pkgName || importId.startsWith(pkgName + '/')) {
            return { id: importId, external: true }
          }
        }
      }
    },
  }
}

export function externalizeExtensionsPlugin(extensionsInput: ExtensionInput): Plugin {
  let extensionMap = normalizeExtensionMap(extensionsInput)

  return {
    name: 'externalize-extensions',
    resolveId(importId) {
      const newImportId = findAndReplaceExtensions(importId, extensionMap)

      if (newImportId) {
        return { id: newImportId, external: true }
      }
    },
  }
}

// Reroot Paths
// -------------------------------------------------------------------------------------------------

export interface RerootOptions {
  oldRoot: string
  newRoot: string
  extensions?: ExtensionInput
}

export function rerootPlugin(options: RerootOptions): Plugin {
  const oldRootAndSep = options.oldRoot + pathSep
  const newRootAndSep = options.newRoot + pathSep
  const extensionMap = options.extensions && normalizeExtensionMap(options.extensions)

  return {
    name: 'reroot',
    resolveId(importId, importerPath) {
      const importPath = computeImportPath(importId, importerPath)

      if (
        (!extensionMap || findAndReplaceExtensions(importId, extensionMap)) &&
        (importPath && importPath.startsWith(oldRootAndSep))
      ) {
        return newRootAndSep + importPath.substring(oldRootAndSep.length)
      }
    },
  }
}

// Minify
// -------------------------------------------------------------------------------------------------

export function minifySeparatelyPlugin(): Plugin {
  return {
    name: 'minify-separately',
    async writeBundle(options, bundles) {
      const { file, dir } = options

      if (file) {
        await minifySeparately(resolvePath(file))
      } else if (dir) {
        await Promise.all(
          Object.keys(bundles).map((bundlePath) => {
            return minifySeparately(resolvePath(joinPaths(dir, bundlePath)))
          }),
        )
      } else {
        throw new Error('For minification, must specify dir or file output option')
      }
    },
  }
}

async function minifySeparately(path: string): Promise<void> {
  const pathMatch = path.match(/^(.*)(\.[cm]?js)$/)

  if (!pathMatch) {
    throw new Error('Invalid extension for minification')
  }

  return execLive([
    joinPaths(standardScriptsDir, 'node_modules/.bin/terser'),
    '--config-file', 'config/terser.json',
    '--output', pathMatch[1] + '.min' + pathMatch[2],
    '--', path,
  ], {
    cwd: standardScriptsDir,
  })
}

// Extensions Find & Replace Utils
// -------------------------------------------------------------------------------------------------

type ExtensionMap = { [findExtension: string]: string }
type ExtensionInput = string[] | ExtensionMap

function normalizeExtensionMap(input: ExtensionInput): ExtensionMap {
  let map: ExtensionMap = {}

  if (Array.isArray(input)) {
    for (const extension of input) {
      map[extension] = extension
    }
  } else {
    map = input
  }

  return map
}

function findAndReplaceExtensions(path: string, extensionMap: ExtensionMap): string | undefined {
  for (let extension in extensionMap) {
    if (path.endsWith(extension)) {
      const newExtension = extensionMap[extension]

      return path.substring(0, path.length - extension.length) + newExtension
    }
  }
}

// Import ID Utils
// -------------------------------------------------------------------------------------------------

function computeImportPath(importId: string, importerPath: string | undefined): string | undefined {
  if (isAbsolute(importId)) {
    return importId
  }

  if (isImportRelative(importId)) {
    return importerPath ?
      joinPaths(dirname(importerPath), importId) :
      resolvePath(importId) // from CWD
  }

  // otherwise, probably an external dependency
}

function isImportRelative(importId: string): boolean {
  return importId.startsWith('./') || importId.startsWith('../')
}
