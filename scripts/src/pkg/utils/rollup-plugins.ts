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

// Externalize certain paths
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
          // return absolute is possible via makeAbsoluteExternalsRelative
          return { id: importPath, external: true }
        }
      }
    },
  }
}

// Externalize certain packages
// -------------------------------------------------------------------------------------------------

export interface ExternalizePkgsOptions {
  pkgNames: string[],
  moduleSideEffects?: boolean
  forceExtension?: string
}

export function externalizePkgsPlugin(
  { pkgNames, moduleSideEffects, forceExtension }: ExternalizePkgsOptions,
): Plugin {
  return {
    name: 'externalize-pkgs',
    resolveId(importId) {
      if (!isImportRelative(importId)) {
        for (const pkgName of pkgNames) {
          if (importId === pkgName || importId.startsWith(pkgName + '/')) {
            if (forceExtension) {
              if (importId === pkgName) {
                importId += '/index' + forceExtension
              } else {
                importId += forceExtension
              }
            }

            return { id: importId, external: true, moduleSideEffects }
          }
        }
      }
    },
  }
}

// Externalize certain extensions
// -------------------------------------------------------------------------------------------------

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

// Simple Global-Name Dot Assignment
// -------------------------------------------------------------------------------------------------

export function simpleDotAssignment(): Plugin {
  return {
    name: 'simple-dot-assignment',
    outputOptions(outputOptions) {
      const { name } = outputOptions

      if (name && name.includes('.')) {
        return {
          ...outputOptions,
          name: encodeDotName(name),
        }
      }
    },
    renderChunk(code, chunk, outputOptions) {
      const { name } = outputOptions

      if (name && isEncodedDotName(name)) {
        return replaceDotAssignments(code)
      }
    },
  }
}

function encodeDotName(dotName: string): string {
  return '__dot_name_' + dotName.replaceAll('.', '_') + '__'
}

function isEncodedDotName(name: string): boolean {
  return name.startsWith('__dot_name_')
}

function replaceDotAssignments(code: string): string {
  let replaced = false

  code = code.replace(/var __dot_name_(\w+)__ =/, (whole, dotName) => {
    replaced = true
    return dotName.replaceAll('_', '.') + ' ='
  })

  if (!replaced) {
    throw new Error('Error transforming dot assignment')
  }

  return code
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
        this.error('For minification, must specify dir or file output option')
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

// .d.ts
// -------------------------------------------------------------------------------------------------

/*
Workarounds rollup-plugin-dts
*/
export function massageDtsPlugin(): Plugin {
  return {
    name: 'massage-dts',
    renderChunk(code) {
      // force all import statements (especially auto-generated chunks) to have a .js extension
      // TODO: file a bug. code splitting w/ es2016 modules
      code = code.replace(/(} from ['"])([^'"]*)(['"])/g, (whole, start, importId, end) => {
        if (
          importId.startsWith('./') && // relative ID
          !importId.endsWith('.js')
        ) {
          return start + importId + '.js' + end
        }
        return whole
      })

      return code
    },
  }
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
