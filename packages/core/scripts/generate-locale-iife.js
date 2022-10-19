import { join as joinPaths, basename } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'

const pkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(pkgDir, 'src/locales/iife.js.tpl')

export default async function(entryAlias) {
  const localeCode = basename(entryAlias)

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ localeCode })

  return code
}
