
/*
 * This file defines the JS dependencies required to run a barebones FullCalendar example.
 *
 * Additionally, if run from Node (i.e. the build system), this file will serve as a module that
 * exports the dependency file list.
 *
 * Additionally, if run from a browser, this file will write a <script> tag for each dependency.
 */


// all files are relative to the project root

var files = [
	'lib/jquery-1.8.1.min.js',
	'lib/jquery-ui-1.8.23.custom.min.js'
];


if (typeof module !== 'undefined') {

	//
	// in a Node module
	//

	module.exports = files;

}
else if (typeof window !== 'undefined') {

	//
	// in a browser
	//

	var root;
	var scripts = document.getElementsByTagName('script');
	var i;

	// determine the current script's directory
	for (i=0; i<scripts.length; i++) {
		var match = (scripts[i].getAttribute('src') || '').match(/^(.*)\/build\/deps\.js/);
		if (match) {
			root = match[1];
			break;
		}
	}

	// write the dependency script tags
	for (i=0; i<files.length; i++) {
		document.write("<script src='" + root + "/" + files[i] + "'></script>\n");
	}

}