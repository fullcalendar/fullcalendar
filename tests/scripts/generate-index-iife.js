import { join as joinPaths, resolve as resolvePath } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { capture } from '@fullcalendar/workspace-scripts/utils/exec'

const pkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(pkgDir, 'src/index.iife.js.tpl')

export default async function main() {
  const srcDir = resolvePath('./src') // HACK: works when called from other test dirs

  let testPaths = await capture(
    'find . -mindepth 2 -type f \\( -name \'*.ts\' -or -name \'*.tsx\' \\) -print0 | ' +
    'xargs -0 grep -E "(fdescribe|fit)\\("',
    { cwd: srcDir },
  ).then(
    (res) => strToLines(res.stdout).map((line) => line.trim().split(':')[0]),
    () => [], // TODO: somehow look at stderr string. if empty, simply no testPaths. if populated, real error
  )

  if (testPaths.length) {
    console.log(
      'Only test files that have fdescribe/fit:\n' +
      testPaths.map((path) => ` - ${path}`).join('\n'),
    )
  } else {
    testPaths = strToLines((await capture(
      'find . -mindepth 2 -type f \\( -name \'*.ts\' -or -name \'*.tsx\' \\)',
      { cwd: srcDir },
    )).stdout)

    console.log(`Using all ${testPaths.length} test files.`)
  }

  const extensionlessTestPaths = testPaths.map((testPath) => testPath.replace(/\.tsx?$/, ''))

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ extensionlessTestPaths })

  return code
}

function strToLines(s) {
  s = s.trim()
  return s ? s.split('\n') : []
}
