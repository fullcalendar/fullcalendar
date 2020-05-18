const path = require('path')
const nodeResolve = require('@rollup/plugin-node-resolve')
const alias = require('@rollup/plugin-alias')
const { checkNoSymlinks } = require('./scripts/lib/new')
const { externalizeStylesheets, buildAliasMap } = require('./scripts/lib/new-rollup')


/*
needs tsc to run first
but needs symlinks killed also
*/

const { bundleStructs, packageStructs } = require('./scripts/lib/package-index')
checkNoSymlinks(bundleStructs)

module.exports = bundleStructs.map((struct) => {
  return {
    input: path.join(struct.dir, struct.mainTscJs),
    output: {
      format: 'iife',
      name: 'FullCalendar',
      file: path.join(struct.dir, struct.mainDistJs)
    },
    plugins: [
      externalizeStylesheets(), // will cause it be IGNORED for iiffe. good
      alias({
        entries: buildAliasMap(packageStructs)
      }),
      nodeResolve()
    ]
  }
})
