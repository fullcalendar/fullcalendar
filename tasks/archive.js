const gulp = require('gulp')
const rename = require('gulp-rename')
const filter = require('gulp-filter')
const modify = require('gulp-modify-file')
const zip = require('gulp-zip')

// determines the name of the ZIP file
const packageConfig = require('../package.json')
const packageId = packageConfig.name + '-' + packageConfig.version

gulp.task('archive', [
  'archive:dist',
  'archive:misc',
  'archive:deps',
  'archive:demos'
], function() {
  // make the zip, with a single root directory of a similar name
  return gulp.src('tmp/' + packageId + '/**/*', { base: 'tmp/' })
    .pipe(zip(packageId + '.zip'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('archive:dist', [ 'dist' ], function() {
  return gulp.src([
    'dist/*.{js,css}',
    'dist/plugins/*.js',
    'dist/plugins/*.css',
    'dist/locales/*.js',
    'dist/locales-all.js'
  ], {
    base: 'dist/'
  })
    .pipe(gulp.dest('tmp/' + packageId + '/'))
})

gulp.task('archive:misc', function() {
  return gulp.src([
    'LICENSE.*',
    'CHANGELOG.*',
    'CONTRIBUTING.*'
  ])
    .pipe(rename({ extname: '.txt' }))
    .pipe(gulp.dest('tmp/' + packageId + '/'))
})

gulp.task('archive:deps', function() {
  return gulp.src([
    'node_modules/superagent/superagent.js'
  ])
    .pipe(gulp.dest('tmp/' + packageId + '/demos/js/'))
})

// transfers demo files, transforming their paths to dependencies
gulp.task('archive:demos', function() {
  return gulp.src('**/*', { cwd: 'demos/', base: 'demos/' })
    .pipe(htmlFileFilter)
    .pipe(demoPathModify)
    .pipe(htmlFileFilter.restore) // pipe thru files that didn't match htmlFileFilter
    .pipe(gulp.dest('tmp/' + packageId + '/demos/'))
})

const htmlFileFilter = filter('*.html', { restore: true })
const demoPathModify = modify(function(content) {
  return content.replace(
    /((?:src|href)=['"])([^'"]*)(['"])/g,
    function(m0, m1, m2, m3) {
      return m1 + transformDemoPath(m2) + m3
    }
  )
})

function transformDemoPath(path) {
  // reroot 3rd party libs that we include in our dist
  path = path.replace('../node_modules/superagent/', 'js/') // js dir in the demos dir

  // reroot 3rd party libs that request from CDN
  path = path.replace('../node_modules/rrule/', 'https://cdn.jsdelivr.net/npm/rrule@2.5.5/')
  path = path.replace('../node_modules/dragula/dist/', 'https://cdn.jsdelivr.net/npm/dragula@3.7.2/')
  path = path.replace('../node_modules/jquery/dist/', 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/')
  path = path.replace('../node_modules/components-jqueryui/', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/')

  // reroot dist files to archive root
  path = path.replace('../dist/', '../')

  if (
    !/\.min\.(js|css)$/.test(path) && // not already minified
    !/^\w/.test(path) && // reference to demo util js/css file
    path !== '../locales-all.js' && // this file is already minified
    path !== '../lib/superagent.js' // doesn't have a .min.js, but that's okay
  ) {
    // use minified
    path = path.replace(/\/([^/]*)\.(js|css)$/, '/$1.min.$2')
  }

  return path
}
