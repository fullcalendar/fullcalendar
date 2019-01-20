#!/usr/bin/env node

const fs = require('fs')

let version = process.argv[2] // the first command line arg

if (!version) {
  console.error('Please specify a single argument, the version.')
  process.exit(1) // error code

} else {
  const packageConfig = require('../package.json')
  packageConfig.version = version
  fs.writeFileSync('package.json', JSON.stringify(packageConfig, null, '  '))
}
