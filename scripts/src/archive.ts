import { join as joinPaths, dirname, sep as pathSeparator } from 'path'
import { createWriteStream } from 'fs'
import { mkdir, readFile, rm } from 'fs/promises'
import { globby } from 'globby'
import archiver from 'archiver'
import { MonorepoStruct } from './utils/monorepo-struct.js'
import { ScriptContext } from './utils/script-runner.js'
import { getArchiveRootDirs } from './utils/monorepo-config.js'
import { iifeSubextension } from './pkg/utils/config.js'

export default function(this: ScriptContext) {
  return writeMonorepoArchives(this.monorepoStruct)
}

export async function writeMonorepoArchives(monorepoStruct: MonorepoStruct): Promise<void> {
  await Promise.all(
    getArchiveRootDirs(monorepoStruct).map((rootDir) => createArchive(rootDir)),
  )
}

export async function deleteMonorepoArchives(monorepoStruct: MonorepoStruct): Promise<void> {
  await Promise.all(
    getArchiveRootDirs(monorepoStruct).map((rootDir) => deleteArchives(rootDir)),
  )
}

async function createArchive(rootDir: string): Promise<void> {
  const bundleDir = joinPaths(rootDir, 'bundle')
  const bundleJson = await readFile(joinPaths(bundleDir, 'package.json'), 'utf8')
  const bundleMeta = JSON.parse(bundleJson)
  const archiveId = `${bundleMeta.name}-${bundleMeta.version}`

  const archivePath = joinPaths(rootDir, `dist/${archiveId}.zip`)
  await mkdir(dirname(archivePath), { recursive: true })

  const archiveStream = createWriteStream(archivePath)
  archiveStream.on('close', () => {
    console.log(`${archive.pointer()} bytes written to ${archivePath}`)
  })

  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(archiveStream)

  ;['README.md', 'LICENSE.md'].forEach((subpath) => {
    archive.file(
      joinPaths(rootDir, subpath),
      { name: `${archiveId}/${subpath}` },
    )
  })

  archive.directory(joinPaths(bundleDir, 'examples'), `${archiveId}/examples`)
  archive.glob(
    `dist/*${iifeSubextension}.+(js|min.js)`,
    { cwd: bundleDir },
    { prefix: archiveId },
  )

  const subpaths = await globby(
    `packages/*/dist/**/*${iifeSubextension}.+(js|min.js)`,
    { cwd: rootDir },
  )

  for (const subpath of subpaths) {
    const subpathParts = subpath.split(pathSeparator)
    subpathParts.splice(2, 1) // remove 'dist'

    archive.file(
      joinPaths(rootDir, subpath),
      { name: [archiveId].concat(subpathParts).join('/') },
    )
  }

  return archive.finalize()
}

async function deleteArchives(rootDir: string): Promise<void> {
  const distDir = joinPaths(rootDir, 'dist')

  await rm(distDir, { recursive: true, force: true })
}
