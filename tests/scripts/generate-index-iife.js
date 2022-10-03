import { resolve as resolvePath } from 'path'
import { capture } from '@fullcalendar/workspace-scripts/utils/exec'

export default async function main() {
  const srcPathAbs = resolvePath('./src')

  let testPaths = await capture(
    "find . -mindepth 2 -type f \\( -name '*.ts' -or -name '*.tsx' \\) -print0 | " +
    'xargs -0 grep -E "(fdescribe|fit)\\("',
    { cwd: srcPathAbs }
  ).then(
    (res) => strToLines(res.stdout).map((line) => line.trim().split(':')[0]),
    () => [], // TODO: somehow look at stderr string. if empty, simply no testPaths. if populated, real error
  )

  if (testPaths.length) {
    console.log(
      'Only test files that have fdescribe/fit:\n' +
      testPaths.map((path) => ` - ${path}`).join('\n')
    )
  } else {
    testPaths = strToLines((await capture(
      "find . -mindepth 2 -type f \\( -name '*.ts' -or -name '*.tsx' \\)",
      { cwd: srcPathAbs }
    )).stdout)

    console.log(`Using all ${testPaths.length} test files.`)
  }

  return `
    import './index.js';

    ${testPaths.map((testPath) => testPath.replace(/\.tsx?$/, '.js')).map((p) => {
      return `import '${p}';\n`
    }).join('\n')}
  `
}

function strToLines(s) {
  s = s.trim()
  return s ? s.split('\n') : []
}
