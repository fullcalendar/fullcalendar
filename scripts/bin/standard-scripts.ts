#!/usr/bin/env node

import { join as joinPaths } from 'path'
import { fileURLToPath } from 'url'
import { runScript } from '../src/utils/script-runner.ts'

const thisPkgDir = joinPaths(fileURLToPath(import.meta.url), '../..')
runScript(thisPkgDir)
