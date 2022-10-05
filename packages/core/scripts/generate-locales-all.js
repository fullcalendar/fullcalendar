import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { globby } from 'globby'
import { default as handlebars } from 'handlebars'

const pkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(pkgDir, 'src/locales-all.js.tpl')
const localesDir = joinPaths(pkgDir, 'src/locales')

export default async function() {
  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)

  const localeFilenames = await globby('*.ts', { cwd: localesDir })
  const localeCodes = localeFilenames.map((filename) => filename.replace(/\.ts$/, ''))
  const code = template({ localeCodes })

  return code
}
