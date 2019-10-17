const path = require('path')
const handleBars = require('handlebars')
const { readFile, writeFile } = require('./util')
const { pkgStructs } = require('./pkg-struct')


exports.writePkgReadmes = writePkgReadmes


function writePkgReadmes() {
  return readFile('packages/README.md.tpl').then((templateText) => {
    return handleBars.compile(templateText)
  }).then((template) => {
    return Promise.all(
      pkgStructs.map((pkgStruct) => {
        let readmeText = template(pkgStruct.jsonObj)
        let readmePath = path.join(pkgStruct.distDir, 'README.md')

        return writeFile(readmePath, readmeText)
      })
    )
  })
}
