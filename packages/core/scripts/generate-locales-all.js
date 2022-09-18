import { join as joinPaths, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile, readdir } from 'fs/promises'
import { default as handlebars } from 'handlebars'

const thisDir = dirname(fileURLToPath(import.meta.url))
const templatePath = joinPaths(thisDir, '../src/locales-all.js.tpl')
const localesDir = joinPaths(thisDir, '../src/locales')

export default async function() {
  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const localeCodes = (await readdir(localesDir))
    .filter((filename) => !isFilenameHidden(filename))
    .map((filename) => removeExtension(filename))

  const code = template({
    localeCodes,
  })

  return code
}

/*
TODO: more DRY
*/

function isFilenameHidden(filename) {
  return Boolean(filename.match(/^\./))
}

function removeExtension(path) {
  const match = path.match(/^(.*)\.([^\/]*)$/)
  return match ? match[1] : path
}
