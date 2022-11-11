
export const transpiledSubdir = 'dist/.tsout'
export const transpiledExtension = '.js'
export const srcExtensions = ['.ts', '.tsx']
export const assetExtensions = ['.css']

/*
Predictable chunk names are better for TypeScript and es2016 module-resolution
when made explicit in package.json
*/
export const entryManualChunk: { [entryAlias: string]: string } = {
  'internal': 'internal-common',
}
