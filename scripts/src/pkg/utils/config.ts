
export const transpiledSubdir = 'dist/.tsout'
export const transpiledExtension = '.js'
export const srcExtensions = ['.ts', '.tsx']
export const assetExtensions = ['.css']
export const iifeSubExtension = '.global'

/*
For a consistent chunk name
*/
export const entryManualChunk: { [entryAlias: string]: string } = {
  'internal': 'internal-common',
}
