import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { execCapture } from '@fullcalendar/workspace-scripts/utils/exec'

const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(thisPkgDir, 'src/index.iife.js.tpl')

export function getWatchPaths(config) {
  const transpileDir = joinPaths(config.pkgDir, 'dist/.tsout')

  return [transpileDir, templatePath]
}

export default async function(config) {
  // NOTE: when changing this to the src/ directory,
  // make sure to update getWatchPaths and all .js/.jsx extensions below
  const transpileDir = joinPaths(config.pkgDir, 'dist/.tsout')

  let testPaths = await execCapture(
    'find . -mindepth 2 -type f \\( -name \'*.js\' -or -name \'*.jsx\' \\) -print0 | ' +
    'xargs -0 grep -E "(fdescribe|fit)\\("',
    { cwd: transpileDir },
  ).then(
    (stdout) => strToLines(stdout).map((line) => line.trim().split(':')[0]),
    () => {
      return [] // TODO: somehow look at stderr string. if empty, simply no testPaths. if populated, real error
    },
  )

  if (testPaths.length) {
    config.log(
      'Only test files that have fdescribe/fit:\n' +
      testPaths.map((path) => `  ${path}`).join('\n'),
    )
  } else {
    testPaths = strToLines((await execCapture(
      'find . -mindepth 2 -type f \\( -name \'*.js\' -or -name \'*.jsx\' \\)',
      { cwd: transpileDir },
    )))

    config.log(`Using all ${testPaths.length} test files`)
  }

  const extensionlessTestPaths = testPaths.map((testPath) => testPath.replace(/\.[jt]sx?$/, ''))

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ extensionlessTestPaths })

  return code
}

function strToLines(s) {
  s = s.trim()
  return s ? s.split('\n') : []
}
