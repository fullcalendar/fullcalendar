var gulp = require('gulp');
var gfile = require('gulp-file'); // for virtual files from string buffers
var gutil = require('gulp-util');
var modify = require('gulp-modify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var fs = require('fs');
var del = require('del');

// global state for locale:each:data
var localeData; // array of virtual files that gulp-file accepts
var skippedLocaleCodes;

// generates individual locale files and the combined one
gulp.task('locale', [ 'locale:each', 'locale:all' ], function() {
	gutil.log(skippedLocaleCodes.length + ' skipped locales: ' + skippedLocaleCodes.join(', '));
	gutil.log(localeData.length + ' generated locales.');
});

// watches changes to any locale, and rebuilds all
gulp.task('locale:watch', [ 'locale' ], function() {
	return gulp.watch('locale/*.js', [ 'locale' ]);
});

gulp.task('locale:clean', function() {
	return del([
		'dist/locale-all.js',
		'dist/locale/'
	]);
});

// generates the combined locale file, minified
gulp.task('locale:all', [ 'locale:each:data' ], function() {
	return gfile(localeData, { src: true }) // src:true for using at beginning of pipeline
		.pipe(modify({
			fileModifier: function(file, content) {
				return wrapWithClosure(content);
			}
		}))
		.pipe(concat('locale-all.js'))
		.pipe(modify({
			fileModifier: function(file, content) {
				// code for resetting the locale back to English
				content += '\nmoment.locale("en");';
				content += '\n$.fullCalendar.locale("en");';
				content += '\nif ($.datepicker) $.datepicker.setDefaults($.datepicker.regional[""]);';

				return wrapWithUMD(content);
			}
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});

// generates each individual locale file, minified
gulp.task('locale:each', [ 'locale:each:data' ], function() {
	return gfile(localeData, { src: true }) // src:true for using at beginning of pipeline
		.pipe(modify({
			fileModifier: function(file, content) {
				return wrapWithUMD(content); // each locale file needs its own UMD wrap
			}
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/locale/'));
});

// populates global-state variables with individual locale code
gulp.task('locale:each:data', function() {
	localeData = [];
	skippedLocaleCodes = [];

	return gulp.src('node_modules/moment/locale/*.js')
		.pipe(modify({
			fileModifier: function(file, momentContent) {
				var localeCode = file.path.match(/([^\/\\]*)\.js$/)[1];
				var js = getLocaleJs(localeCode, momentContent);

				if (js) {
					insertLocaleData(localeCode, js);
				}
				else {
					skippedLocaleCodes.push(localeCode);
				}

				return ''; // `modify` needs a string result
			}
		}));
});


// inserts into the global-state locale array, maintaining alphabetical order
function insertLocaleData(localeCode, js) {
	var i;

	for (i = 0; i < localeData.length; i++) {
		if (localeCode < localeData[i].name) { // string comparison
			break;
		}
	}

	localeData.splice(i, 0, { // insert at index
		name: localeCode + '.js',
		source: js
	});
}


function getLocaleJs(localeCode, momentContent) {
	
	var shortLocaleCode;
	var momentLocaleJS;
	var datepickerLocaleJS;
	var fullCalendarLocaleJS;

	// given "fr-ca", get just "fr"
	if (localeCode.indexOf('-') != -1) {
		shortLocaleCode = localeCode.replace(/-.*/, '');
	}

	momentLocaleJS = extractMomentLocaleJS(momentContent);

	datepickerLocaleJS = getDatepickerLocaleJS(localeCode);
	if (!datepickerLocaleJS && shortLocaleCode) {
		datepickerLocaleJS = getDatepickerLocaleJS(shortLocaleCode, localeCode);
	}

	fullCalendarLocaleJS = getFullCalendarLocaleJS(localeCode);
	if (!fullCalendarLocaleJS && shortLocaleCode) {
		fullCalendarLocaleJS = getFullCalendarLocaleJS(shortLocaleCode, localeCode);
	}

	// If this is an "en" locale, only the Moment config is needed.
	// For all other locales, all 3 configs are needed.
	if (momentLocaleJS && (shortLocaleCode == 'en' || (datepickerLocaleJS && fullCalendarLocaleJS))) {

		// if there is no definition, we still need to tell FC to set the default
		if (!fullCalendarLocaleJS) {
			fullCalendarLocaleJS = '$.fullCalendar.locale("' + localeCode + '");';
		}

		datepickerLocaleJS = datepickerLocaleJS || '';

		return momentLocaleJS + '\n' +
			datepickerLocaleJS + '\n' +
			fullCalendarLocaleJS;
	}
}


function wrapWithUMD(body) {
	return [
		'(function(factory) {',
		'    if (typeof define === "function" && define.amd) {',
		'        define([ "jquery", "moment" ], factory);',
		'    }',
		'    else if (typeof exports === "object") {',
		'        module.exports = factory(require("jquery"), require("moment"));',
		'    }',
		'    else {',
		'        factory(jQuery, moment);',
		'    }',
		'})(function($, moment) {',
		'',
		body,
		'',
		'});'
	].join('\n');
}


function wrapWithClosure(body) {
	return [
		'(function() {',
		'',
		body,
		'',
		'})();'
	].join('\n');
}


function extractMomentLocaleJS(js) {

	// remove the UMD wrap
	js = js.replace(
		/\(\s*function[\S\s]*?function\s*\(\s*moment\s*\)\s*\{([\S\s]*)\}\)\)\)?;?/,
		function(m0, body) {
			return body;
		}
	);

	// the JS will return a value. wrap in a closure to avoid haulting execution
	js = '(function() {\n' + js + '})();\n';

	return js;
}


function getDatepickerLocaleJS(localeCode, targetLocaleCode) {

	// convert "en-ca" to "en-CA"
	var datepickerLocaleCode = localeCode.replace(/\-(\w+)/, function(m0, m1) {
		return '-' + m1.toUpperCase();
	});

	var path = 'node_modules/components-jqueryui/ui/i18n/datepicker-' + datepickerLocaleCode + '.js';
	var js;

	try {
		js = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	js = js.replace( // remove the UMD wrap
		/\(\s*function[\S\s]*?function\s*\(\s*datepicker\s*\)\s*\{([\S\s]*)\}\s*\)\s*\)\s*;?/m,
		function(m0, body) { // use only the function body, modified

			var match = body.match(/datepicker\.regional[\S\s]*?(\{[\S\s]*?\});?/);
			var props = match[1];

			// remove 1 level of tab indentation
			props = props.replace(/^\t/mg, '');

			return "$.fullCalendar.datepickerLocale(" +
				"'" + (targetLocaleCode || localeCode) + "', " + // for FullCalendar
				"'" + datepickerLocaleCode + "', " + // for datepicker
				props +
				");";
		}
	);

	return js;
}


function getFullCalendarLocaleJS(localeCode, targetLocaleCode) {

	var path = 'locale/' + localeCode + '.js';
	var js;

	try {
		js = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	// if we originally wanted "ar-ma", but only "ar" is available, we have to adjust
	// the declaration
	if (targetLocaleCode && targetLocaleCode != localeCode) {
		js = js.replace(
			/\$\.fullCalendar\.locale\(['"]([^'"]*)['"]/,
			'$.fullCalendar.locale("' + targetLocaleCode + '"'
		);
	}

	return js;
}
