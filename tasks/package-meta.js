const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const gulp = require('gulp')
const rootPackageConfig = require('../package.json')
const tsConfig = require('../tsconfig')

let packagePaths = tsConfig.compilerOptions.paths

gulp.task('package-meta', [ 'package-meta:text', 'package-meta:json' ])

gulp.task('package-meta:text', function() {
  let stream = gulp.src('LICENSE.*')

  for (let packageName in packagePaths) {
    let shortPackageName = path.basename(packageName) // using path utils for normal strings :(

    stream = stream.pipe(
      gulp.dest('dist/' + shortPackageName)
    )
  }

  return stream
})

gulp.task('package-meta:json', function() {

  for (let packageName in packagePaths) {
    let shortPackageName = path.basename(packageName) // using path utils for normal strings :(
    let packagePath = packagePaths[packageName][0]
    let overridePath = path.dirname(packagePath) + '/package.json'
    let overrides = {}

    if (fs.existsSync(overridePath)) {
      overrides = require('../' + overridePath)
    }

    let content = buildPackageConfig(packageName, overrides)

    let dir = 'dist/' + shortPackageName
    mkdirp.sync(dir)

    fs.writeFileSync(
      dir + '/package.json',
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

      if (rootPackageConfig.devDependencies[dependencyName]) {
        dependencies[dependencyName] = rootPackageConfig.devDependencies[dependencyName]

      } else if (dependencyName in packagePaths) {
        let dependencyPath = packagePaths[dependencyName][0]

        if (dependencyPath.match(/^src\//)) {
          dependencies[dependencyName] = rootPackageConfig.version || '0.0.0'
        }
      } else {
        console.error('Unknown dependency', dependencyName)
      }
    }

    res.dependencies = dependencies
  }

  if (packageName !== '@fullcalendar/core') {
    let peerDependencies = overrides.peerDependencies || {}
    peerDependencies['@fullcalendar/core'] = rootPackageConfig.version || '0.0.0'
    res.peerDependencies = peerDependencies
  }

  res.main = 'main.js'
  res.types = 'main.d.ts'

  return res
}
