import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { globby } from 'globby'
import { default as handlebars } from 'handlebars'

const pkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(pkgDir, 'src/locales-all.js.tpl')
const localesDir = joinPaths(pkgDir, 'src/locales')

export default async function() {
  const localeFilenames = await globby('*.ts', { cwd: localesDir })

  // TODO: use basename to remove extension
  const localeCodes = localeFilenames.map((filename) => filename.replace(/\.ts$/, ''))

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ localeCodes })

  return code
}
