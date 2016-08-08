var gulp = require('gulp');
var gutil = require('gulp-util');
var modify = require('gulp-modify');
var moment = require('moment');

// parsed command line arguments
var argv = require('yargs').argv;

gulp.task('bump', function(done) {
	if (!argv.version) {
		gutil.log('specify a command line --version arg');
		done(1); // error code
	}
	else {
		return gulp.src('package.json')
			.pipe(modify({
				fileModifier: function(file, content) {
					var obj = JSON.parse(content);

					obj.releaseDate = moment().format('YYYY-MM-DD'); // TODO: placeholder in json files!
					obj.version = argv.version;

					return JSON.stringify(obj, null, '  '); // indent using two spaces
				}
			}))
			.pipe(gulp.dest('./')); // overwrite itself!
	}
});
