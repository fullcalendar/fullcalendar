const path = require('path')
const { src, dest, parallel } = require('gulp')
const modify = require('gulp-modify-file')
const rename = require('gulp-rename')
const zip = require('gulp-zip')
const { promisifyVinyl } = require('./util')


/*
assumes everything already built
*/
exports.archive = parallel(
  writeStandardArchive,
  writePremiumArchive
)


function writeStandardArchive() {
  return writeArchive({
    archiveName: 'fullcalendar',
    pkgFiles: [
      'packages/*/dist/**'
    ],
    exampleHtmlFiles: [
      '*.html',
      '!*+(resource|timeline)*.html',
      '!_*.html'
    ],
    exampleOtherFiles: [
      'js/*',
      'json/*',
      '!json/*resource*.json',
      'php/*'
    ],
    topLevelFiles: [
      'README.md',
      'LICENSE.txt'
    ]
  })
}


function writePremiumArchive() {
  return writeArchive({
    archiveName: 'fullcalendar-scheduler',
    pkgFiles: [
      'packages?(-premium)/*/dist/**'
    ],
    exampleHtmlFiles: [
      '*+(resource|timeline)*.html',
      '!_*.html'
    ],
    exampleOtherFiles: [
      'js/*',
      'json/*'
    ],
    topLevelFiles: [
      'packages-premium/README.md',
      'packages-premium/LICENSE.md'
    ]
  })
}


function writeArchive(options) {
  let version = require(path.join(process.cwd(), 'package.json')).version

  return writeArchiveFiles(options).then(function(tmpDir) {
    return promisifyVinyl(
      src(tmpDir + '/**')
        .pipe(zip(options.archiveName + '-' + version + '.zip'))
        .pipe(dest('archives'))
    )
  })
}


function writeArchiveFiles(options) {
  let tmpDir = path.join('tmp/archives', options.archiveName)

  // packages/whatever/dist/file.js -> packages/whatever/file.js
  let writingPkgs = promisifyVinyl(
    src(
      options.pkgFiles.concat([ '!**/dist' ]), // hack to prevent empty dist dir
      { base: '.' }
    ).pipe(
      rename((pathParts) => {
        pathParts.dirname = transformPkgPath(pathParts.dirname)
      })
    ).pipe(dest(tmpDir))
  )

  let writingOtherExampleFiles = promisifyVinyl(
    src(options.exampleOtherFiles, { cwd: 'examples', base: '.' })
      .pipe(dest(tmpDir))
  )

  let writingTopLevelFiles = promisifyVinyl(
    src(options.topLevelFiles)
      .pipe(dest(tmpDir))
  )

  return Promise.all([
    writingPkgs,
    writeExampleHtmlAndVendor(options.exampleHtmlFiles, tmpDir),
    writingOtherExampleFiles,
    writingTopLevelFiles
  ]).then(function() {
    return tmpDir
  })
}


function writeExampleHtmlAndVendor(exampleHtmlFiles, tmpDir) {
  let vendorPaths = []

  let writingExampleHtmlFiles = promisifyVinyl(
    src(exampleHtmlFiles, { cwd: 'examples', base: '.' })
      .pipe(modify(replaceContent))
      .pipe(dest(tmpDir))
  )

  function replaceContent(content) {
    return content.replace(
      /((?:src|href)=['"])([^'"]*)(['"])/g,
      function(m0, m1, m2, m3) {
        return m1 + transformResourcePath(m2) + m3
      }
    )
  }

  function transformResourcePath(resourcePath) {

    if (resourcePath.indexOf('../packages') === 0) { // one of our package files
      resourcePath = transformPkgPath(resourcePath)
    }

    resourcePath = resourcePath.replace(
      /^\.\.\/(node_modules\/.*\/([^/]+))$/,
      function(m0, m1, m2) {
        vendorPaths.push(m1) // the path on the filesystem from proj root
        return '../vendor/' + m2 // how the html file will reference it
      }
    )

    return resourcePath
  }

  return writingExampleHtmlFiles.then(function() {
    if (vendorPaths.length) {
      return promisifyVinyl(
        src(vendorPaths)
          .pipe(dest(tmpDir + '/vendor'))
      )
    }
  })
}


function transformPkgPath(path) {
  return path.replace(/(^|\/)dist(\/|$)/, '$2')
}
