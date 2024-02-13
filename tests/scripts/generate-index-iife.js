import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'
import { execCapture } from '@fullcalendar-scripts/standard/utils/exec'

/*
TODO: don't always display prefix when doing config.log()
TODO: don't reinit rollup watcher on ANY change. Slow when not using fdescribe technique.
*/

const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const templatePath = joinPaths(thisPkgDir, 'src/index.global.js.tpl')

/*
HACK: watch the transpiled directory, so bundling waits until tsc completes
*/
export function getWatchPaths(config) {
  const transpileDir = joinPaths(config.pkgDir, 'dist/.tsout')

  return [transpileDir, templatePath]
}

export default async function(config) {
  const srcDir = joinPaths(config.pkgDir, 'src')

  // mindepth 2 means subdirectories
  let testPaths = await execCapture(
    'find . -mindepth 2 -type f \\( -name \'*.ts\' -or -name \'*.tsx\' \\) -print0 | ' +
    'xargs -0 grep -E "(fdescribe|fit)\\("',
    { cwd: srcDir },
  ).then(
    (stdout) => strToLines(stdout).map((line) => line.trim().split(':')[0]),
    () => {
      return [] // TODO: somehow look at stderr string. if empty, simply no testPaths. if populated, real error
    },
  )

  // the `find` command reports multiple matches per file. consolidate duplicates
  testPaths = uniqueStrs(testPaths)

  if (testPaths.length) {
    config.log(
      'Only test files that have fdescribe/fit:\n' +
      testPaths.join('\n'),
    )
  } else {
    // mindepth 2 means subdirectories
    testPaths = strToLines((await execCapture(
      'find . -mindepth 2 -type f \\( -name \'*.ts\' -or -name \'*.tsx\' \\)',
      { cwd: srcDir },
    )))

    config.log(`Using all ${testPaths.length} test files`)
  }

  const extensionlessTestPaths = testPaths.map((testPath) => testPath.replace(/\.tsx?$/, ''))

  const templateText = await readFile(templatePath, 'utf8')
  const template = handlebars.compile(templateText)
  const code = template({ extensionlessTestPaths })

  return code
}

function uniqueStrs(strs) {
  const map = {}

  for (const str of strs) {
    map[str] = true
  }

  return Object.keys(map)
}

function strToLines(str) {
  str = str.trim()
  return str ? str.split('\n') : []
}
