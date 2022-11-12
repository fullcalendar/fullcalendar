
export const srcExtensions = ['.ts', '.tsx']
export const iifeSubExtension = '.global'
export const assetExtensions = ['.css']
export const transpiledSubdir = 'dist/.tsout'
export const transpiledExtension = '.js'

/*
For consistent chunk names
*/
export const manualChunkMap: { [entryAlias: string]: string } = {
  'internal': 'internal-common',
}
