import {
  join as joinPaths,
  resolve as resolvePath,
  dirname,
  sep as pathSep,
  isAbsolute,
} from 'path'
import { readFile, writeFile } from 'fs/promises'
import { existsSync, statSync } from 'fs'
import { createRequire } from 'module'
import { type Plugin } from 'rollup'
import Terser, { type MinifyOptions as TerserOptions } from 'terser'
import cssnano from 'cssnano'
import { standardScriptsDir } from '../../utils/script-runner.ts'
import { type CopyOperation } from './bundle-struct.ts'

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

// Remap Imports
// -------------------------------------------------------------------------------------------------

export interface RemapImportsOptions {
  mappings: { [oldImport: string]: string }
  forceExternal?: boolean
  debug?: boolean
}

/**
 * Finds a matching remap for an import ID.
 * Supports exact matches and single-wildcard patterns (e.g., "react/*" -> "preact/*").
 * Exact matches take precedence over wildcard matches.
 */
export function findRemapMatch(
  importId: string,
  mappings: Record<string, string>,
): string | undefined {
  // First: check for exact match (highest priority)
  if (mappings[importId] !== undefined) {
    return mappings[importId]
  }

  // Second: check wildcard patterns
  const wildcardPatterns = Object.keys(mappings).filter(p => p.includes('*'))

  for (const pattern of wildcardPatterns) {
    const wildcardIndex = pattern.indexOf('*')
    const prefix = pattern.substring(0, wildcardIndex)
    const suffix = pattern.substring(wildcardIndex + 1)

    if (importId.startsWith(prefix) && (!suffix || importId.endsWith(suffix))) {
      const captureStart = prefix.length
      const captureEnd = suffix ? importId.length - suffix.length : importId.length

      if (captureStart <= captureEnd) {
        const captured = importId.substring(captureStart, captureEnd)
        return mappings[pattern].replace('*', captured)
      }
    }
  }

  return undefined
}

export function remapImportsPlugin(
  { mappings, forceExternal, debug }: RemapImportsOptions,
): Plugin {
  return {
    name: 'remap-imports',
    async resolveId(importId, importer, options) {
      const newId = findRemapMatch(importId, mappings)

      if (newId !== undefined) {
        if (debug) {
          console.log(`Remapped import: "${importId}" -> "${newId}"`)
        }
        if (forceExternal) {
          return { id: newId, external: true }
        }
        // Continue resolution with the new ID
        // skipSelf: true prevents infinite recursion
        const resolved = await this.resolve(newId, importer, { ...options, skipSelf: true })
        // If nothing resolved it, mark as external
        return resolved ?? { id: newId, external: true }
      }
    },
  }
}

/*
Workaround for rollup-plugin-dts always making non-filepath imports external.
Must go before dts plugin in plugins list
*/
export interface ResolveExternalForDtsOptions {
  debug?: boolean
}

export function resolveExternalForDts(
  { debug }: ResolveExternalForDtsOptions = {},
): Plugin {
  return {
    name: 'resolve-external-for-dts',
    resolveId(importId, importer) {
      if (!isImportRelative(importId) && !isImportAbsolute(importId)) {
        // Create a require function relative to the importer (or cwd if no importer)
        const requireFn = createRequire(importer || import.meta.url)
        let resolved = requireFn.resolve(importId)

        // HACK: avoid CSS modules
        if (!/\.module\.css\.js$/.test(resolved)) {
          resolved = resolved.replace(/\.js$/, '.d.ts')
          if (debug) {
            console.log('mapped', importId, '->', resolved)
          }
          return resolved
        }
      }
    }
  }
}

// Externalize certain packages
// -------------------------------------------------------------------------------------------------

export interface ExternalizePkgsOptions {
  pkgNames: string[],
  moduleSideEffects?: boolean
  debug?: true
}

export function externalizePkgsPlugin(
  { pkgNames, moduleSideEffects, debug }: ExternalizePkgsOptions,
): Plugin {
  return {
    name: 'externalize-pkgs',
    resolveId(importId) {
      if (!isImportRelative(importId)) {
        for (const pkgName of pkgNames) {
          if (importId === pkgName || importId.startsWith(pkgName + '/')) {
            if (debug && !isAbsolute(importId)) {
              console.log('DID externalize', importId)
            }
            return { id: importId, external: true, moduleSideEffects }
          }
        }

        if (debug && !isAbsolute(importId)) {
          console.log('did NOT externalize', importId)
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

// CSS Module Types
// -------------------------------------------------------------------------------------------------

export function cssModuleTypesPlugin(): Plugin {
  return {
    name: 'css-module-types',
    resolveId(importId) {
      // Check if this is a CSS module import
      if (importId.endsWith('.module.css')) {
        // Return a virtual module ID with .d.ts extension so DTS plugin processes it
        return '\0css-module:' + importId + '.d.ts'
      }
    },
    load(id) {
      // Check if this is our virtual CSS module
      if (id.startsWith('\0css-module:') && id.endsWith('.d.ts')) {
        // Return a synthetic type definition
        return {
          code: 'declare const styles: Record<string, string>;\nexport default styles;',
          map: null
        }
      }
    }
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

// Copy Files
// -------------------------------------------------------------------------------------------------

export interface CopyFilesOptions {
  srcToDest: CopyOperation[]
}

export function copyFilesPlugin(options: CopyFilesOptions): Plugin {
  return {
    name: 'copy-files',
    buildStart() {
      for (const { src } of options.srcToDest) {
        this.addWatchFile(src)
      }
    },
    async generateBundle() {
      for (const { src, dest, transform } of options.srcToDest) {
        let source: string | Buffer = await readFile(src)
        if (transform) {
          source = await transform(source.toString())
        }
        this.emitFile({
          type: 'asset',
          fileName: dest,
          source,
        })
      }
    },
  }
}

// Minify
// -------------------------------------------------------------------------------------------------

let terserOptions: TerserOptions | undefined

async function getTerserOptions(): Promise<TerserOptions> {
  if (!terserOptions) {
    const configPath = joinPaths(standardScriptsDir, 'config/terser.json')
    terserOptions = JSON.parse(await readFile(configPath, 'utf8'))
  }
  return terserOptions!
}

export async function minifyJs(jsText: string): Promise<string> {
  const options = await getTerserOptions()
  const result = Terser.minify(jsText, options)
  if (result.code === undefined) {
    throw new Error('Terser minification failed')
  }
  return result.code
}

export async function minifyCss(cssText: string): Promise<string> {
  const result = await cssnano({
    preset: ['default', {
      calc: false,
    }],
  }).process(cssText)
  return result.css
}

// .d.ts
// -------------------------------------------------------------------------------------------------

export interface MassageDtsOptions {
  mappings: Record<string, string>
  debug?: boolean
}

/*
Workarounds rollup-plugin-dts
*/
export function massageDtsPlugin({ mappings, debug }: MassageDtsOptions): Plugin {
  return {
    name: 'massage-dts',
    renderChunk(code) {
      // force all import statements (especially auto-generated chunks) to have a .js extension
      // TODO: file a bug. code splitting w/ es2016 modules
      code = code.replace(/((?:} from|import) ['"])([^'"]*)(['"])/g, (whole, start, importId, end) => {
        if (
          importId.startsWith('./') && // relative ID
          !importId.endsWith('.js')
        ) {
          return start + importId + '.js' + end
        }
        return whole
      })

      // rollup-plugin-dts does run its "declare module" statements through module resolution,
      // so we find another way to support the remapping
      code = code.replace(/(declare module ['"])([^'"]*)(['"])/g, (whole, start, importId, end) => {
        const newId = findRemapMatch(importId, mappings)

        if (newId !== undefined) {
          if (debug) {
            console.log('remap', importId, '->', newId)
          }
          return start + newId + end
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

function isImportAbsolute(importId: string): boolean {
  return importId.startsWith('/')
}
