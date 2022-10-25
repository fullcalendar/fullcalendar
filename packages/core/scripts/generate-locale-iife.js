import { join as joinPaths, basename } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'

const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(thisPkgDir, 'src/locales/iife.js.tpl')

export function getWatchPaths(pkgDir) {
  return [templatePath]
}

export default async function(pkgDir, entryAlias) {
  const localeCode = basename(entryAlias)

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ localeCode })

  return code
}
