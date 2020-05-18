const path = require('path')
const { src, dest, parallel } = require('gulp')
const modify = require('gulp-modify-file')
const zip = require('gulp-zip')
const { promisifyVinyl } = require('./util')


/*
assumes everything already built
*/
module.exports = parallel(
  writeStandardArchive,
  writePremiumArchive
)


function writeStandardArchive() {
  return writeArchive({
    archiveName: 'fullcalendar',
    bundleDir: 'packages/bundle',
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


/*
TODO: for examples, instead of looking for (resource|timeline) in the filename,
leverage whether the html file includes packages-premium/bundle or not.
*/
function writePremiumArchive() {
  return writeArchive({
    archiveName: 'fullcalendar-scheduler',
    bundleDir: 'packages-premium/bundle',
    exampleHtmlFiles: [
      '*+(resource|timeline)*.html',
      'timegrid-views-hscroll.html', // TEMPORARY. TODO: exclude this file from non-premium
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

  let writingPkgs = promisifyVinyl(
    src([
      '*.+(js|css)',
      'locales/*.js'
    ], {
      cwd: options.bundleDir,
      base: options.bundleDir
    }).pipe(
      dest(path.join(tmpDir, 'lib'))
    )
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

    resourcePath = resourcePath.replace(
      /^\.\.\/packages(-premium)?\/bundle\b/,
      '../lib'
    )

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
