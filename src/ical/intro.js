/*!
 * <%= title %> v<%= version %> Google Calendar Plugin
 * Docs & License: <%= homepage %>
 * (c) <%= copyright %>
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery', 'ical-expander' ], factory);
	}
	else if (typeof exports === 'object') { // Node/CommonJS
		module.exports = factory(require('jquery'), require('ical-expander'));
	}
	else {
		factory(jQuery, IcalExpander);
	}
})(function($, IcalExpander) {


var FC = $.fullCalendar;
var Promise = FC.Promise;
var EventSource = FC.EventSource;
var EventSourceParser = FC.EventSourceParser;
var applyAll = FC.applyAll;
