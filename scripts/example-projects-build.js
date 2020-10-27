#!/usr/bin/env node

const path = require('path')
const globby = require('globby')
const exec = require('./lib/shell')

const PROJECTS_ROOT = path.resolve(__dirname, '../example-projects')
const IS_CI = Boolean(process.env.CI)

globby.sync('*', { cwd: PROJECTS_ROOT, onlyDirectories: true }).forEach(function(exampleDir) { // will match ONLY directories
  let exampleName = exampleDir.replace(/\/$/, '')

  if (!exampleName.match('webpack')) {
    console.log(
      `Skipping all example projects except webpack for now.`
    )

  } else {

    let { success: cleanSuccess } = exec.sync([ 'npm', 'run', 'clean' ], {
      cwd: path.join(PROJECTS_ROOT, exampleDir),
      live: true
    })
    if (!cleanSuccess) {
      console.warn(`Failed cleaning example project "${exampleName}"`)
      process.exit(1)
    }

    // tsc
    if (exampleName.match('typescript') && !exampleName.match('vue')) {
      let { success: tscSuccess } = exec.sync([ 'npx', 'tsc' ], {
        cwd: path.join(PROJECTS_ROOT, exampleDir),
        live: true
      })
      if (!tscSuccess) {
        console.warn(`Failed running tsc in example project "${exampleName}"`)
        process.exit(1)
      } else {
        console.log(`Succeeded running tsc in example project "${exampleName}"`)
      }
    }

    let { success: buildSuccess } = exec.sync([ 'npm', 'run', 'build' ], {
      cwd: path.join(PROJECTS_ROOT, exampleDir),
      live: true
    })
    if (!buildSuccess) {
      console.warn(`Failed building example project "${exampleName}"`)
      process.exit(1)
    }
  }
})
