#!/usr/bin/env node

const path = require('path')
const globby = require('globby')
const exec = require('./lib/shell')

const PKGS_ROOT = path.resolve(__dirname, '../packages-contrib')

globby.sync('*', { cwd: PKGS_ROOT, onlyDirectories: true }).forEach(function(pkgDir) { // will match ONLY directories
  let pkgShortName = pkgDir.replace(/\/$/, '')

  let { success } = exec.sync([ 'yarn', 'run', 'ci' ], {
    cwd: path.join(PKGS_ROOT, pkgDir),
    live: true
  })

  if (!success) {
    console.warn(`Failed building package "${pkgShortName}"`)
    process.exit(1)
  }
})
