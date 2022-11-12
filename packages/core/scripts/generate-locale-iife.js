import { join as joinPaths, basename } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'

const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(thisPkgDir, 'src/locales/global.js.tpl')

export function getWatchPaths() {
  return [templatePath, templatePath]
}

export default async function(config) {
  const localeCode = basename(config.entryAlias)

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ localeCode })

  return code
}
