#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLwcPackage } from './lib/build.ts'

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..')

buildLwcPackage({
  packageDir,
  appBuilderComponent: {
    sourceDir: join(packageDir, 'example'),
    componentName: 'fullCalendarDemo',
  },
}).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
