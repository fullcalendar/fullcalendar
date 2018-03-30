const gulp = require('gulp')
const gutil = require('gulp-util')
const shell = require('gulp-shell')
const modify = require('gulp-modify-file')

// parsed command line arguments
const { argv } = require('yargs')

// try to build all example repos
gulp.task('example-repos:build', [ 'webpack', 'ts-types' ], shell.task(
  './bin/build-example-repos.sh'
))

// does a SINGLE example repo
gulp.task('example-repo:bump', function(done) {

  if (!argv.dir) {
    gutil.log('Please specify a command line --dir argument.')
    done(1) // error code
    return
  }

  if (!argv.version) {
    gutil.log('Please specify a command line --version argument.')
    done(1) // error code
    return
  }

  const coreSemVer = '^' + argv.version

  return gulp.src(argv.dir + '/package.json')
    .pipe(
      modify(function(content) {
        const obj = JSON.parse(content)

        obj.dependencies['fullcalendar'] = coreSemVer

        return JSON.stringify(obj, null, '  ') // indent using two spaces
      })
    )
    .pipe(gulp.dest(argv.dir)) // overwrite itself!
})
