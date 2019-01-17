const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const rootPackageConfig = require('../package.json')
const tsConfig = require('../tsconfig')

let packagePaths = tsConfig.compilerOptions.paths

gulp.task('package-meta', [ 'package-meta:text', 'package-meta:json' ])

gulp.task('package-meta:text', function() {
  let stream = gulp.src('LICENSE.*')

  for (let packageName in packagePaths) {
    stream = stream.pipe(
      gulp.dest('dist/' + packageName)
    )
  }

  return stream
})

gulp.task('package-meta:json', function() {

  for (let packageName in packagePaths) {
    let packagePath = packagePaths[packageName][0]
    let overridePath = path.dirname(packagePath) + '/package.json'
    let overrides = {}

    if (fs.existsSync(overridePath)) {
      overrides = require('../' + overridePath)
    }

    let content = buildPackageConfig(packageName, overrides)

    fs.writeFileSync(
      'dist/' + packageName + '/package.json',
      JSON.stringify(content, null, '  ')
    )
  }
})

function buildPackageConfig(packageName, overrides) {
  let res = Object.assign({}, rootPackageConfig, overrides, {
    name: packageName
  })

  delete res.devDependencies
  delete res.scripts

  if (overrides.dependencies) {
    let dependencies = {}

    for (let dependencyName in overrides.dependencies) {
      dependencies[dependencyName] = rootPackageConfig.devDependencies[dependencyName]
    }

    res.dependencies = dependencies
  }

  return res
}
