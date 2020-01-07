const path = require('path')
const glob = require('glob')
const { WATCH_OPTIONS, isRelPath, getCorePkgStruct, onwarn } = require('./rollup-util')


module.exports = function() {
  let corePkgStruct = getCorePkgStruct()
  let coreTmpDir = path.join('tmp/tsc-output', corePkgStruct.srcDir)
  let localePaths = glob.sync('locales/*.js', { cwd: coreTmpDir })
  let configs = []

  for (let localePath of localePaths) {
    configs.push({
      input: path.join(coreTmpDir, localePath),
      output: {
        file: path.join(corePkgStruct.distDir, localePath),
        format: 'esm'
      },
      external(id) {
        return !isRelPath(id)
      },
      watch: WATCH_OPTIONS,
      onwarn
    })
  }

  return configs
}
