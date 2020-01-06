const path = require('path')
const handleBars = require('handlebars')
const { readFile, writeFile, fileExists } = require('./util')
const { pkgStructs } = require('./pkg-struct')


exports.writePkgReadmes = writePkgReadmes


async function writePkgReadmes() {
  let templateText = await readFile('packages/README.md.tpl')
  let template = handleBars.compile(templateText)

  return Promise.all(
    pkgStructs.map((pkgStruct) => {
      return writePkgReadme(pkgStruct, template)
    })
  )
}


async function writePkgReadme(pkgStruct, template) {
  let readmeDestPath = path.join(pkgStruct.distDir, 'README.md')
  let ownReadmePath = path.join(pkgStruct.dir, 'README.md')
  let hasOwnReadme = await fileExists(ownReadmePath)
  let readmeText

  if (hasOwnReadme) {
    readmeText = await readFile(ownReadmePath)
  } else {
    readmeText = template(pkgStruct.jsonObj)
  }

  return writeFile(readmeDestPath, readmeText)
}
