import archiver from 'archiver'
import { createWriteStream } from 'node:fs'
import {
  access,
  mkdir,
  readFile,
  rm,
} from 'node:fs/promises'
import { join } from 'node:path'
import { finished } from 'node:stream/promises'

export type LwcArchiveConfig = {
  packageDir: string
  archiveBaseName?: string
  licensePath?: string
}

export async function archiveLwcPackage(config: LwcArchiveConfig) {
  const {
    packageDir,
    archiveBaseName = 'fullcalendar-lwc',
    licensePath,
  } = config
  const packageJsonPath = join(packageDir, 'package.json')
  const { version } = JSON.parse(await readFile(packageJsonPath, 'utf8')) as { version: string }
  const defaultMetadataDir = join(packageDir, 'dist', 'force-app', 'main', 'default')
  const archivesDir = join(packageDir, 'archives')
  const archivePath = join(archivesDir, `${archiveBaseName}-${version}.zip`)

  await access(defaultMetadataDir)
  await rm(archivePath, { force: true })
  await mkdir(archivesDir, { recursive: true })

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
  archive.directory(defaultMetadataDir, 'force-app/main/default')
  archive.file(join(packageDir, 'README.md'), { name: 'README.md' })

  if (licensePath) {
    archive.file(licensePath, { name: 'LICENSE.md' })
  }

  await archive.finalize()
  await finished(output)
}
