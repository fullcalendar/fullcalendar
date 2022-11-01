import { join as joinPaths } from 'path'
import * as yaml from 'js-yaml'
import lockfileLib from '@pnpm/make-dedicated-lockfile'

export default {
  '.npmrc': {},
  '.editorconfig': {},
  '.gitignore': { generator: scopeGitIgnore },
  'pnpm-workspace.yaml': { generator: scopeWorkspaceFile },
  'pnpm-lock.yaml': { generator: writeScopedLockfile },
  // 'turbo.json': {}, // broken because of git staging bug
  // TODO: .vscode/extensions.json
  // TODO: .vscode/settings.json
}

// .gitignore

async function scopeGitIgnore(readOrig, monorepoDir, subdir) {
  const orig = await readOrig()
  const origLines = orig.split('\n')
  const prefix = `/${subdir}/`
  const scopedLines = []
  let prevAddedEmpty = false

  for (let origLine of origLines) {
    const trimmedLine = origLine.trim()

    if (trimmedLine.indexOf(prefix) === 0) {
      scopedLines.push('/' + trimmedLine.substring(prefix.length))
      prevAddedEmpty = false
    } else if (trimmedLine.indexOf('/') === 0) {
      // out-of-scope. don't add
    } else if (trimmedLine || !prevAddedEmpty) {
      scopedLines.push(origLine)
      prevAddedEmpty = !trimmedLine
    }
  }

  return scopedLines.join('\n')
}

// pnpm-workspace.yaml

async function scopeWorkspaceFile(readOrig, monorepoDir, subdir) {
  const yamlStr = await readOrig()
  const yamlDoc = yaml.load(yamlStr)
  const scopedPkgGlobs = scopePkgGlobs(yamlDoc.packages, subdir)

  if (scopedPkgGlobs.length) {
    yamlDoc.packages = scopedPkgGlobs
    return yaml.dump(yamlDoc)
  }
  // otherwise, if no scoped packages, nothing will be written
}

function scopePkgGlobs(globs, subdir) {
  const scopedGlobs = []
  const prefix = `./${subdir}/`

  for (const glob of globs) {
    if (glob.indexOf(prefix) === 0) {
      scopedGlobs.push('./' + glob.substring(prefix.length))
    }
  }

  return scopedGlobs
}

// pnpm-lock.yaml

function writeScopedLockfile(readOrig, monorepoDir, subdir) {
  return lockfileLib.default(monorepoDir, joinPaths(monorepoDir, subdir))
}
