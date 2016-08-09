var gulp = require('gulp');
var gfile = require('gulp-file'); // for virtual files from string buffers
var gutil = require('gulp-util');
var modify = require('gulp-modify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var fs = require('fs');
var del = require('del');

// global state for lang:each:data
var langData; // array of virtual files that gulp-file accepts
var skippedLangCodes;

// generates individual lang files and the combined one
gulp.task('lang', [ 'lang:each', 'lang:all' ], function() {
	gutil.log(skippedLangCodes.length + ' skipped languages: ' + skippedLangCodes.join(', '));
	gutil.log(langData.length + ' generated languages.');
});

// watches changes to any language, and rebuilds all
gulp.task('lang:watch', [ 'lang' ], function() {
	return gulp.watch('lang/*.js', [ 'lang' ]);
});

gulp.task('lang:clean', function() {
	return del([
		'dist/lang-all.js',
		'dist/lang/'
	]);
});

// generates the combined lang file, minified
gulp.task('lang:all', [ 'lang:each:data' ], function() {
	return gfile(langData, { src: true }) // src:true for using at beginning of pipeline
		.pipe(modify({
			fileModifier: function(file, content) {
				return wrapWithClosure(content);
			}
		}))
		.pipe(concat('lang-all.js'))
		.pipe(modify({
			fileModifier: function(file, content) {
				// code for resetting the language back to English
				content += '\n(moment.locale || moment.lang).call(moment, "en");'; // works with moment-pre-2.8
				content += '\n$.fullCalendar.lang("en");';
				content += '\nif ($.datepicker) $.datepicker.setDefaults($.datepicker.regional[""]);';

				return wrapWithUMD(content);
			}
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});

// generates each individual language file, minified
gulp.task('lang:each', [ 'lang:each:data' ], function() {
	return gfile(langData, { src: true }) // src:true for using at beginning of pipeline
		.pipe(modify({
			fileModifier: function(file, content) {
				return wrapWithUMD(content); // each lang file needs its own UMD wrap
			}
		}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/lang/'));
});

// populates global-state variables with individual lang code
gulp.task('lang:each:data', function() {
	langData = [];
	skippedLangCodes = [];

	return gulp.src('lib/moment/{locale,lang}/*.js') // lang directory is pre-moment-2.8
		.pipe(modify({
			fileModifier: function(file, momentContent) {
				var langCode = file.path.match(/([^\/]*)\.js$/)[1];
				var js = getLangJS(langCode, momentContent);

				if (js) {
					insertLangData(langCode, js);
				}
				else {
					skippedLangCodes.push(langCode);
				}

				return ''; // `modify` needs a string result
			}
		}));
});


// inserts into the global-state lang array, maintaining alphabetical order
function insertLangData(langCode, js) {
	var i;

	for (i = 0; i < langData.length; i++) {
		if (langCode < langData[i].name) { // string comparison
			break;
		}
	}

	langData.splice(i, 0, { // insert at index
		name: langCode + '.js',
		source: js
	});
}


function getLangJS(langCode, momentContent) {
	
	var shortLangCode;
	var momentLangJS;
	var datepickerLangJS;
	var fullCalendarLangJS;

	// given "fr-ca", get just "fr"
	if (langCode.indexOf('-') != -1) {
		shortLangCode = langCode.replace(/-.*/, '');
	}

	momentLangJS = extractMomentLangJS(momentContent);

	datepickerLangJS = getDatepickerLangJS(langCode);
	if (!datepickerLangJS && shortLangCode) {
		datepickerLangJS = getDatepickerLangJS(shortLangCode, langCode);
	}

	fullCalendarLangJS = getFullCalendarLangJS(langCode);
	if (!fullCalendarLangJS && shortLangCode) {
		fullCalendarLangJS = getFullCalendarLangJS(shortLangCode, langCode);
	}

	// If this is an "en" language, only the Moment config is needed.
	// For all other languages, all 3 configs are needed.
	if (momentLangJS && (shortLangCode == 'en' || (datepickerLangJS && fullCalendarLangJS))) {

		// if there is no definition, we still need to tell FC to set the default
		if (!fullCalendarLangJS) {
			fullCalendarLangJS = '$.fullCalendar.lang("' + langCode + '");';
		}

		datepickerLangJS = datepickerLangJS || '';

		return momentLangJS + '\n' +
			datepickerLangJS + '\n' +
			fullCalendarLangJS;
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


function extractMomentLangJS(js) {

	// remove the UMD wrap
	js = js.replace(
		/\(\s*function[\S\s]*?function\s*\(\s*moment\s*\)\s*\{([\S\s]*)\}\)\);?/,
		function(m0, body) {
			return body;
		}
	);

	// the JS will return a value. wrap in a closure to avoid haulting execution
	js = '(function() {\n' + js + '})();\n';

	// make the defineLocale statement compatible with moment-pre-2.8
	js = js.replace(
		/moment\.(defineLocale|lang)\(/m,
		'(moment.defineLocale || moment.lang).call(moment, '
	);

	return js;
}


function getDatepickerLangJS(langCode, targetLangCode) {

	// convert "en-ca" to "en-CA"
	var datepickerLangCode = langCode.replace(/\-(\w+)/, function(m0, m1) {
		return '-' + m1.toUpperCase();
	});

	var path = 'lib/jquery-ui/ui/i18n/datepicker-' + datepickerLangCode + '.js';
	var js;

	try {
		js = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	js = js.replace( // remove the UMD wrap
		/\(\s*function[\S\s]*?function\s*\(\s*datepicker\s*\)\s*\{([\S\s]*)\}\)\);?/m,
		function(m0, body) { // use only the function body, modified

			var match = body.match(/datepicker\.regional[\S\s]*?(\{[\S\s]*?\});?/);
			var props = match[1];

			// remove 1 level of tab indentation
			props = props.replace(/^\t/mg, '');

			return "$.fullCalendar.datepickerLang(" +
				"'" + (targetLangCode || langCode) + "', " + // for FullCalendar
				"'" + datepickerLangCode + "', " + // for datepicker
				props +
				");";
		}
	);

	return js;
}


function getFullCalendarLangJS(langCode, targetLangCode) {

	var path = 'lang/' + langCode + '.js';
	var js;

	try {
		js = fs.readFileSync(path, { encoding: 'utf8' });
	}
	catch (ex) {
		return false;
	}

	// if we originally wanted "ar-ma", but only "ar" is available, we have to adjust
	// the declaration
	if (targetLangCode && targetLangCode != langCode) {
		js = js.replace(
			/\$\.fullCalendar\.lang\(['"]([^'"]*)['"]/,
			'$.fullCalendar.lang("' + targetLangCode + '"'
		);
	}

	return js;
}
