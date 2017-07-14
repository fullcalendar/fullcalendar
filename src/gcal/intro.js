/*!
 * <%= title %> v<%= version %> Google Calendar Plugin
 * Docs & License: <%= homepage %>
 * (c) <%= copyright %>
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery' ], factory);
	}
	else if (typeof exports === 'object') { // Node/CommonJS
		module.exports = factory(require('jquery'));
	}
	else {
		factory(jQuery);
	}
})(function($) {


var FC = $.fullCalendar;
var Promise = FC.Promise;
var EventSource = FC.EventSource;
var JsonFeedEventSource = FC.JsonFeedEventSource;
var EventSourceParser = FC.EventSourceParser;
var applyAll = FC.applyAll;
