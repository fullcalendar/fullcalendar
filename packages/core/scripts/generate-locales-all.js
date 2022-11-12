import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { globby } from 'globby'
import handlebars from 'handlebars'

const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(thisPkgDir, 'src/locales-all.js.tpl')
const localesDir = joinPaths(thisPkgDir, 'src/locales')

export function getWatchPaths() {
  return [
    templatePath,
    localesDir,
  ]
}

export default async function() {
  const localeFilenames = await globby('*.ts', { cwd: localesDir })
  const localeCodes = localeFilenames.map((filename) => filename.replace(/\.ts$/, ''))

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ localeCodes })

  return code
}
