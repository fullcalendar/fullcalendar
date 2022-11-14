
export const srcExtensions = ['.ts', '.tsx']
export const transpiledSubdir = 'dist/.tsout'
export const transpiledExtension = '.js'
export const esmExtension = '.esm.js'
export const cjsExtension = '.js'
export const iifeSubExtension = '.global' // always ends in .js
export const assetExtensions = ['.css']

/*
For consistent chunk names
*/
export const manualChunkMap: { [entryAlias: string]: string } = {
  'internal': 'internal-common',
}
