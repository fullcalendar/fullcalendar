#!/usr/bin/env node

const fs = require('fs')
const moment = require('moment')

let version = process.argv[2] // the first command line arg

if (!version) {
  console.error('Please specify a single argument, the version.')
  process.exit(1) // error code

} else {
  const packageConfig = require('../package.json')

  packageConfig.version = version
  packageConfig.releaseDate = moment().format('YYYY-MM-DD')

  fs.writeFileSync('package.json', JSON.stringify(packageConfig, null, '  '))
}
