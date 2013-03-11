(function() {


/*
 * Modules that will be implicitly included
 */
var DEFAULT_MODULES = [ 'jquery', 'jquery-ui', 'fullcalendar'/*the submodule*/ ];


/*
 * Generate HTML script/link tags for loading resources.
 *
 * @param {String} root
 *     Path to the project or distributable's root directory from the HTML file running this script.
 *
 * @param {Object} fileIndex
 *     File location information for each module/submodule (everything in files.js).
 *
 * @param {String} moduleString
 *     A comma-separated string with names of additional modules to load.
 *
 * @param {string} [buildType]
 *     unspecified - use source JS/CSS files
 *     "concat" - use concatenated JS/CSS files
 *     "min" - use minified JS files, concatenated CSS files
 *     "dist" - use minified JS files, concatenated CSS files, and write paths for distributable
 */
function buildTags(root, fileIndex, moduleString, buildType) {

	var extraModuleNames = moduleString ? moduleString.split(',') : [];
	var moduleNames = DEFAULT_MODULES.concat(extraModuleNames);

	var jsPaths = [];
	var cssPaths = [];
	var printCssPaths = [];

	var buildRoot;
	if (buildType == 'dist') {
		buildRoot = root; // in the distributable, the build root IS the root
	}
	else {
		buildRoot = root + '/build/out';
	}

	each(moduleNames, function(moduleName) {

		var submodule = fileIndex.fullcalendar[moduleName];
		var module = submodule || fileIndex[moduleName];

		if (module) {

			var js = arrayify(module.js);
			var css = arrayify(module.css);
			var printCss = arrayify(module.printCss);

			if (buildType && submodule) {
				//
				// paths for a "built" fullcalendar submodule
				//
				if (js.length) {
					jsPaths.push(buildRoot + '/fullcalendar/' + moduleName + (buildType == 'concat' ? '' : '.min') + '.js');
				}
				if (css.length) {
					cssPaths.push(buildRoot + '/fullcalendar/' + moduleName + '.css');
				}
				if (printCss.length) {
					printCssPaths.push(buildRoot + '/fullcalendar/' + moduleName + '.print.css');
				}
			}
			else if (buildType == 'dist' && !submodule) {
				//
				// 3rd-party paths in the distributable (they all go in jquery/ for now)
				//
				each(js, function(path) {
					jsPaths.push(buildRoot + '/jquery/' + basename(path));
				});
				each(css, function(path) {
					cssPaths.push(buildRoot + '/jquery/' + basename(path));
				});
				each(printCss, function(path) {
					printCssPaths.push(buildRoot + '/jquery/' + basename(path));
				});
			}
			else {
				//
				// paths for development
				//
				each(js, function(path) {
					if (!/(intro|outro)\.js$/.test(path)) { // don't write syntactically incorrect intro.js/outro.js
						jsPaths.push(root + '/' + path);
					}
				});
				each(css, function(path) {
					cssPaths.push(root + '/' + path);
				});
				each(printCss, function(path) {
					printCssPaths.push(root + '/' + path);
				});
			}
		}
	});

	return [].concat(
		map(cssPaths, buildCssTag),
		map(printCssPaths, buildPrintCssTag),
		map(jsPaths, buildJsTag)
		)
		.join('\n');
}


/* When run in a browser...
====================================================================================================*/


/*
 * Writes script/link tags for resources.
 * Attributes can be added to loader.js's script tag to change its behavior:
 *    data-modules="..." (a comma-separated list of additional modules to load)
 *    data-debug="true"
 */
function run() {

	var thisScript = getLastScript();
	var src = thisScript.getAttribute('src');
	var cwd = dirname(src);
	var projectRoot = dirname(cwd);
	var moduleString = thisScript.getAttribute('data-modules');
	var debugEnabled = !!thisScript.getAttribute('data-debug');
	var buildType = getQueryStringVar('build');

	if (debugEnabled) {
		buildType = buildType || getCookieVar('build'); // fall back to cookie
		initDebug(buildType);
	}

	loadScript(projectRoot + '/files.js', function(fileIndex) {
		document.write(
			buildTags(projectRoot, fileIndex, moduleString, buildType)
		);
	});
}


/*
 * Installs a build-switching <select> box at top left of screen.
 */
function initDebug(currentBuildType) {
	window.onload = function() {
		var form = $(
			"<form type='GET' style='position:absolute;top:5px;left:5px'>" +
				"<select name='build'>" +
					"<option value=''>src</option>" +
					"<option value='concat'>concat</option>" +
					"<option value='min'>min</option>" +
				"</select>" +
			"</form>"
		);

		var select = form.find('select')
			.on('change', function() {
				var val = select.val();
				if (!val) {
					select.remove(); // erases from resulting query string
				}
				document.cookie = 'build=' + val; // save cookie
				form.submit();
			})
			.val(currentBuildType || '');

		$('body').append(form);
	};
}


/* HTML-building Utilities
====================================================================================================*/


function buildJsTag(path) {
	return "<script src='" + path + "'></script>"
}


function buildCssTag(path) {
	return "<link href='" + path + "' rel='stylesheet' />";
}


function buildPrintCssTag(path) {
	return "<link href='" + path + "' rel='stylesheet' media='print' />";
}


/* DOM Utilities
====================================================================================================*/

/*
 * Loads an external JS file in the global scope, and calls `callback` when done.
 * If the JS file is a CommonJS module, the module's "exports" will be given to the callback.
 */
function loadScript(path, callback) {
	var funcName = ('_scriptCallback' + Math.random()).replace('.', '');
	document.write("<script>exports = {}; module = { exports: exports }</script>");
	document.write("<script src='" + path + "'></script>");
	document.write("<script>" + funcName + "()</script>");
	window[funcName] = function() {
		removeLastScript();
		removeLastScript();
		removeLastScript();
		var exports = module.exports;
		delete window.module;
		delete window.exports;
		delete window[funcName];
		if (callback) {
			callback(exports);
		}
	};
}


function removeLastScript() {
	var script = getLastScript();
	script.parentNode.removeChild(script);
}


function getLastScript() {
	var scripts = document.getElementsByTagName('script');
	return scripts[scripts.length - 1];
}


function getQueryStringVar(name) {
	var qs = extractQueryString(window.location.href);
	var match = new RegExp(name + '=([^&]*)').exec(qs);
	if (match) {
		return match[1];
	}
}


function getCookieVar(name) {
	var match = new RegExp(name + '=([^;]*)').exec(document.cookie);
	if (match) {
		return match[1];
	}
}


/* File Path Utilities
====================================================================================================*/


function basename(path) {
	var match = /.*\/(.*)/.exec(path);
	return match ? match[1] : path;
}


function dirname(path) {
	var match = /(.*)\//.exec(path);
	return match ? match[1] : '.';
}


function extractQueryString(url) {
	var match = /\?(.*)/.exec(url);
	return match ? match[1] : '';
}


/* Language Utilities
====================================================================================================*/


function each(a, f) {
	for (var i=0; i<a.length; i++) {
		f(a[i], i);
	}
}


function map(a, f) {
	var res = [];
	for (var i=0; i<a.length; i++) {
		res.push(
			f(a[i], i)
		);
	}
	return res;
}


function arrayify(a) {
	return [].concat(a || []);
}


/* RUN!
====================================================================================================*/


if (typeof exports != 'undefined') {
	exports.buildTags = buildTags; // if we are running in Node, provide the buildTags() utility
}
else {
	run(); // we are running in a web browser
}


})();