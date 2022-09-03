
const scriptName: string = process.argv[2]
const otherArgs: string[] = process.argv.slice(3)

if (typeof scriptName !== 'string') {
  throw new Error('Must specify a script name.')
}
if (!scriptName.match(/[a-zA-Z-:]/)) {
  throw new Error(`Script ${scriptName} has invalid name.`)
}

const scriptPath = './' + scriptName.replaceAll(':', '/')
const scriptImport = await import(scriptPath)
scriptImport.default(otherArgs)

// this file is ESM (needed for top-level await)
export {}
