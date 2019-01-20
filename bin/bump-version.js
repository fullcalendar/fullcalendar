#!/usr/bin/env node

const fs = require('fs')
const argv = require('yargs').argv // parsed command line arguments

if (!argv.version) {
  console.error('Please specify a command line --version argument.')
  process.exit(1) // error code

} else {
  const packageConfig = require('../package.json')
  packageConfig.version = argv.version
  fs.writeFileSync('package.json', JSON.stringify(packageConfig, null, '  '))
}
