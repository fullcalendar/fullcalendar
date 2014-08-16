var pathLib = require('path');

module.exports = function(grunt) {

	var config = grunt.config('generateLanguages');


	grunt.registerTask('generateLanguages', function() {

		var combinedJS = '';
		var languageCnt = 0;
		var skippedLangCodes = [];

		grunt.file.mkdir(config.dest, 0755);

		grunt.file.expand(pathLib.join(config.moment, '*.js')).forEach(function(momentPath) {

			var langCode = momentPath.match(/([^\/]*)\.js$/)[1];
			var js = getLangJS(langCode, momentPath);

			if (js) {

				grunt.file.write(
					pathLib.join(config.dest, langCode + '.js'),
					wrapWithUMD(js)
				);

				combinedJS += wrapWithClosure(js) + '\n';

				languageCnt++;
			}
			else {
				skippedLangCodes.push(langCode);
			}

		});

		// code for resetting the language back to English
		combinedJS += '\n(moment.locale || moment.lang).call(moment, "en");'; // works with moment-pre-2.8
		combinedJS += '\n$.fullCalendar.lang("en");';
		combinedJS += '\nif ($.datepicker) $.datepicker.setDefaults($.datepicker.regional[""]);';

		if (config.allDest) {
			grunt.file.write(config.allDest, wrapWithUMD(combinedJS));
		}

		grunt.log.writeln(skippedLangCodes.length + ' skipped languages: ' + skippedLangCodes.join(', '));
		grunt.log.writeln(languageCnt + ' generated languages.');

	});


	function getLangJS(langCode, momentPath) {
		
		var shortLangCode;
		var momentLangJS;
		var datepickerLangJS;
		var fullCalendarLangJS;

		// given "fr-ca", get just "fr"
		if (langCode.indexOf('-') != -1) {
			shortLangCode = langCode.replace(/-.*/, '');
		}

		momentLangJS = getMomentLangJS(momentPath);

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


	function getMomentLangJS(path) { // file assumed to exist

		var js = grunt.file.read(path);

		js = js.replace( // remove the UMD wrap
			/\(\s*function[\S\s]*?function\s*\(\s*moment\s*\)\s*\{([\S\s]*)\}\)\);?/,
			function(m0, body) {
				body = body.replace(/^    /mg, ''); // remove 1 level of indentation
				return body;
			}
		);

		// replace the `return` statement so execution continues
		// compatible with moment-pre-2.8
		js = js.replace(
			/^(\s*)return moment\.(defineLocale|lang)\(/m,
			'$1(moment.defineLocale || moment.lang).call(moment, '
		);

		return js;
	}


	function getDatepickerLangJS(langCode, targetLangCode) {

		// convert "en-ca" to "en-CA"
		var datepickerLangCode = langCode.replace(/\-(\w+)/, function(m0, m1) {
			return '-' + m1.toUpperCase();
		});

		var path = pathLib.join(config.datepicker, 'datepicker-' + datepickerLangCode + '.js');
		var js;

		try {
			js = grunt.file.read(path);
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

		var path = pathLib.join(config.fullCalendar, langCode + '.js');
		var js;

		try {
			js = grunt.file.read(path);
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


};
