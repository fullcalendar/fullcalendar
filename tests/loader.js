
var _origVars = [];
for (var _prop in window) {
	_origVars.push(_prop);
}

function varLeaks() {
	for (var prop in window) {
		var found = false;
		for (var i=0; i<_origVars.length; i++) {
			if (prop == _origVars[i]) {
				found = true;
				break;
			}
		}
		if (!found) {
			console.log(prop);
		}
	}
}

var m = window.location.href.match(/\?(.*)$/);
var queryString = m ? m[1] : '';

function queryStringParam(name) {
	m = queryString.match(new RegExp("(?:^|&)"+name+"(?:=([^&]))?"));
	if (m) {
		if (m[1]) return m[1];
		return true;
	}
}

function includeJS(src) {
	document.write("<script type='text/javascript' src='" + src + "'><\/script>");
}

function includeCSS(href) {
	document.write("<link rel='stylesheet' type='text/css' href='" + href + "' />");
}

var _build = queryStringParam('build');
var _minified = queryStringParam('minified');
var _legacy = queryStringParam('legacy');

if (_build) {
	includeCSS('../build/fullcalendar/fullcalendar.css');
}else{
	includeCSS('../src/css/main.css');
	includeCSS('../src/css/grid.css');
	includeCSS('../src/css/agenda.css');
}

if (_legacy) {
	includeJS('jquery-legacy/jquery.js');
	includeJS('jquery-legacy/ui.core.js');
	includeJS('jquery-legacy/ui.draggable.js');
	includeJS('jquery-legacy/ui.resizable.js');
}
else if (_build) {
	includeJS('../build/fullcalendar/jquery/jquery.js');
	includeJS('../build/fullcalendar/jquery/ui.core.js');
	includeJS('../build/fullcalendar/jquery/ui.draggable.js');
	includeJS('../build/fullcalendar/jquery/ui.resizable.js');
}
else {
	//includeJS('jquery-1.4.1.min.js');
	//includeJS('jquery-uncompressed.js');
	includeJS('../src/jquery/jquery.js');
	includeJS('../src/jquery/ui.core.js');
	includeJS('../src/jquery/ui.draggable.js');
	includeJS('../src/jquery/ui.resizable.js');
}

if (_build) {
	if (_minified) {
		includeJS('../build/fullcalendar/fullcalendar.min.js');
	}else{
		includeJS('../build/fullcalendar/fullcalendar.js');
	}
	includeJS('../build/fullcalendar/gcal.js');
}else{
	includeJS('../src/main.js');
	includeJS('../src/grid.js');
	includeJS('../src/agenda.js');
	includeJS('../src/view.js');
	includeJS('../src/util.js');
	includeJS('../src/gcal.js');
}

if (!window.DISABLE_FIREBUG_LITE) {
	includeJS('firebug-lite/firebug-lite-compressed.js');
}

window.onload = function() {
	$('body').append(
		"<form style='position:absolute;top:0;right:0;text-align:right;font-size:10px;color:#666'>" +
			"<label for='build'>build</label> " +
			"<input type='checkbox' id='build' name='build'" + (_build ? " checked='checked'" : '') +
				" style='vertical-align:middle' onclick='$(this).parent().submit()' />" +
			"<br />" +
			"<label for='minified'>minified</label> " +
			"<input type='checkbox' id='minified' name='minified'" + (_minified ? " checked='checked'" : '') +
				" style='vertical-align:middle' onclick='$(this).parent().submit()' />" +
			"<br />" +
			"<label for='legacy'>legacy</label> " +
			"<input type='checkbox' id='legacy' name='legacy'" + (_legacy ? " checked='checked'" : '') +
				" style='vertical-align:middle' onclick='$(this).parent().submit()' />" +
		"</form>"
	);
};
