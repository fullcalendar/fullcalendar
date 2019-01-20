const gulp = require('gulp')
const filter = require('gulp-filter')
const modify = require('gulp-modify-file')
const uglify = require('gulp-uglify')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')
const zip = require('gulp-zip')

// determines the name of the ZIP file
const packageConfig = require('../package.json')
const archiveId = packageConfig.name + '-' + (packageConfig.version || 'latest')

// assumes a clean dist already happened
gulp.task('archive', [ 'archive:files' ], function() {
  // make the zip, with a single root directory of a similar name
  return gulp.src('tmp/' + archiveId + '/**', { base: 'tmp/' })
    .pipe(
      zip(archiveId + '.zip')
    )
    .pipe(
      gulp.dest('archives/')
    )
})

gulp.task('archive:files', [
  'archive:packages',
  'archive:packages:minjs',
  'archive:packages:mincss',
  'archive:demos',
  'archive:vendor',
  'archive:meta'
])

gulp.task('archive:packages', [ 'build' ], function() {
  return gulp.src([
    'dist/**/*.{js,css}'
  ]).pipe(
    gulp.dest('tmp/' + archiveId + '/packages')
  )
})

gulp.task('archive:packages:minjs', [ 'archive:packages' ], function() {
  return gulp.src([
    'tmp/' + archiveId + '/packages/*/*.js',
    '!**/*.min.js' // avoid double minify
  ], { base: '.' })
    .pipe(
      uglify({
        preserveComments: 'some' // keep comments starting with !
      })
    )
    .pipe(
      rename({ extname: '.min.js' })
    )
    .pipe(gulp.dest('.'))
})

gulp.task('archive:packages:mincss', [ 'archive:packages' ], function() {
  return gulp.src([
    'tmp/' + archiveId + '/packages/*/*.css',
    '!**/*.min.css' // avoid double minify
  ], { base: '.' })
    .pipe(
      cssmin()
    )
    .pipe(
      rename({ extname: '.min.css' })
    )
    .pipe(
      gulp.dest('.')
    )
})

gulp.task('archive:meta', function() {
  return gulp.src([
    'LICENSE.*',
    'CHANGELOG.*'
  ]).pipe(
    gulp.dest('tmp/' + archiveId)
  )
})

gulp.task('archive:demos', function() {
  return gulp.src([
    'demos/**',
    '!**/_*' // no files that start with underscore
  ])
    .pipe(htmlFileFilter)
    .pipe(demoPathModify)
    .pipe(htmlFileFilter.restore) // pipe thru files that didn't match htmlFileFilter
    .pipe(
      gulp.dest('tmp/' + archiveId + '/demos')
    )
})

gulp.task('archive:vendor', [ 'archive:demos' ], function() {
  return gulp.src(
    vendorPaths,
    { cwd: 'node_modules' } // a cwd without a base will flatten the paths. what we want
  ).pipe(
    gulp.dest('tmp/' + archiveId + '/packages')
  )
})

const htmlFileFilter = filter('**/*.html', { restore: true })
const demoPathModify = modify(function(content) {
  return content.replace(
    /((?:src|href)=['"])([^'"]*)(['"])/g,
    function(m0, m1, m2, m3) {
      return m1 + transformDemoPath(m2) + m3
    }
  )
})

let vendorPaths = []

function transformDemoPath(path) {
  path = path.replace('../dist/', '../packages/')

  path = path.replace(
    /^\.\.\/node_modules\/(.*)\/([^/]+)$/,
    function(m0, m1, m2) {
      vendorPaths.push(m1 + '/' + m2)
      return '../packages/' + m2
    }
  )

  return path
}
