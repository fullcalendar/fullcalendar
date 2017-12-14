var gulp = require('gulp')
var gutil = require('gulp-util')
var modify = require('gulp-modify-file')
var moment = require('moment')

// parsed command line arguments
var argv = require('yargs').argv

// modifies the package.json file in-place with new release-specific values.
// called from the command-line.
gulp.task('bump', function(done) {
  if (!argv.version) {
    gutil.log('Please specify a command line --version argument.')
    done(1) // error code
  } else {
    return gulp.src('package.json')
      .pipe(
        modify(function(content) {
          var obj = JSON.parse(content)

          obj.releaseDate = moment().format('YYYY-MM-DD') // always do current date
          obj.version = argv.version // from command line

          return JSON.stringify(obj, null, '  ') // indent using two spaces
        })
      )
      .pipe(
        gulp.dest('./') // overwrite itself!
      )
  }
})
