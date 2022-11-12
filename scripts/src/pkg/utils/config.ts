
export const transpiledSubdir = 'dist/.tsout'
export const transpiledExtension = '.js'
export const srcExtensions = ['.ts', '.tsx']
export const assetExtensions = ['.css']
export const iifeSubExtension = '.global'

/*
For onsistent chunk names
*/
export const manualChunkMap: { [entryAlias: string]: string } = {
  'internal': 'internal-common',
}
