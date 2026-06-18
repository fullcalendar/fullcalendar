#!/usr/bin/env node

import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { mkdir, readFile, rm } from 'fs/promises'
import { finished } from 'stream/promises'
import {
  dirname as dirnamePath,
  join as joinPaths,
  resolve as resolvePath,
  sep as pathSeparator,
} from 'path'
import { fileURLToPath } from 'url'
import { globby } from 'globby'

const archiveName = 'fullcalendar'
const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
const packageJsonPath = joinPaths(thisPkgDir, 'package.json')
const licensePath = joinPaths(thisPkgDir, '..', '..', 'LICENSE.md')

const archivePatterns = [
  'dist/all.global.js',
  'dist/locales-all.global.js',
  'dist/skeleton.css',
  'dist/locales/*.global.js',
  'dist/themes/*/global.js',
  'dist/themes/*/theme.css',
  'dist/themes/*/palette.css',
  'dist/themes/*/palettes/**/*',
  'examples/**/*',
]

// Keys and values are posix-relative paths within the archive
const fileRenames: Record<string, string> = {
  'dist/all.global.js': 'dist/fullcalendar.global.js',
}

// Applied to all examples/**/*.html files
const htmlReplacements: [from: string, to: string][] = [
  ['../dist/all.global.js', '../dist/fullcalendar.global.js'],
]

export default async function archiveVanillaZip() {
  const { version: packageVersion } = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
    version: string
  }
  const archiveRootName = `${archiveName}-${packageVersion}`
  const archivePath = joinPaths(thisPkgDir, 'archives', `${archiveRootName}.zip`)

  await rm(archivePath, { force: true })
  await mkdir(dirnamePath(archivePath), { recursive: true })

  const output = createWriteStream(archivePath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.on('warning', (error) => {
    if (error.code !== 'ENOENT') {
      output.destroy(error)
    }
  })
  archive.on('error', (error) => {
    output.destroy(error)
  })
  output.on('error', (error) => {
    archive.destroy(error)
  })

  archive.pipe(output)

  const relPaths = (await globby(archivePatterns, {
    cwd: thisPkgDir,
    onlyFiles: true,
    dot: false,
    followSymbolicLinks: false,
  })).sort((left, right) => left.localeCompare(right))

  for (const relPath of relPaths) {
    const relPosixPath = relPath.split(pathSeparator).join('/')
    const renamedPosixPath = fileRenames[relPosixPath] ?? relPosixPath
    const entryName = `${archiveRootName}/${renamedPosixPath}`

    if (relPosixPath.startsWith('examples/') && relPosixPath.endsWith('.html')) {
      let content = await readFile(joinPaths(thisPkgDir, relPath), 'utf8')
      for (const [from, to] of htmlReplacements) {
        content = content.replaceAll(from, to)
      }
      archive.append(content, { name: entryName })
    } else {
      archive.file(joinPaths(thisPkgDir, relPath), { name: entryName })
    }
  }

  archive.file(licensePath, {
    name: `${archiveRootName}/LICENSE.md`,
  })

  await archive.finalize()
  await finished(output)
}

if (process.argv[1] && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  archiveVanillaZip().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
