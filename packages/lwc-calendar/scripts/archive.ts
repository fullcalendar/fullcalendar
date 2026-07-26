#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { archiveLwcPackage } from './lib/archive.ts'

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..')

archiveLwcPackage({ packageDir }).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
