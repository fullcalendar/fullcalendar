
// input
export const srcExtensions = ['.ts', '.tsx']
export const srcIifeSubextension = '.global' // always ends in srcExtensions
export const transpiledSubdir = 'dist/.tsout'
export const transpiledExtension = '.js'
export const assetExtensions = ['.css']

// output
export const esmExtension = '.esm.js'
export const cjsExtension = '.js'
export const iifeSubextension = '.global' // always ends in .js

/*
For consistent chunk names
*/
export const manualChunkEntryAliases: { [chunkName: string]: string[] } = {
  'internal-common': ['internal'],
}
