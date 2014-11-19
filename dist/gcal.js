/*!
 * FullCalendar v2.2.1 Google Calendar Plugin
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 */
 
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery' ], factory);
	}
	else {
		factory(jQuery);
	}
})(function($) {


var API_BASE = 'https://www.googleapis.com/calendar/v3/calendars';
var fc = $.fullCalendar;
var applyAll = fc.applyAll;


fc.sourceNormalizers.push(function(sourceOptions) {
	var url = sourceOptions.url;
	var match;

	// if the Google Calendar ID hasn't been explicitly defined
	if (!sourceOptions.googleCalendarId && url) {

		// detect if the ID was specified as a single string
		if ((match = /^[\w-]+@[\w-\.]+\.calendar\.google\.com$/.test(url))) {
			sourceOptions.googleCalendarId = url;
		}
		// try to scrape it out of a V1 or V3 API feed URL
		else if (
			(match = /^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^\/]*)/.exec(url)) ||
			(match = /^https?:\/\/www.google.com\/calendar\/feeds\/([^\/]*)/.exec(url))
		) {
			sourceOptions.googleCalendarId = decodeURIComponent(match[1]);
		}
	}

	// make each google calendar source uneditable by default
	if (sourceOptions.googleCalendarId) {
		if (sourceOptions.editable == null) {
			sourceOptions.editable = false;
		}
	}
});


fc.sourceFetchers.push(function(sourceOptions, start, end, timezone) {
	if (sourceOptions.googleCalendarId) {
		return transformOptions(sourceOptions, start, end, timezone, this); // `this` is the calendar
	}
});


function transformOptions(sourceOptions, start, end, timezone, calendar) {
	var url = API_BASE + '/' + encodeURI(sourceOptions.googleCalendarId) + '/events?callback=?'; // jsonp
	var apiKey = sourceOptions.googleCalendarApiKey || calendar.options.googleCalendarApiKey;
	var success = sourceOptions.success;
	var data;

	function reportError(message, apiErrorObjs) {
		var errorObjs = apiErrorObjs || [ { message: message } ]; // to be passed into error handlers
		var consoleObj = window.console;
		var consoleWarnFunc = consoleObj ? (consoleObj.warn || consoleObj.log) : null;

		// call error handlers
		(sourceOptions.googleCalendarError || $.noop).apply(calendar, errorObjs);
		(calendar.options.googleCalendarError || $.noop).apply(calendar, errorObjs);

		// print error to debug console
		if (consoleWarnFunc) {
			consoleWarnFunc.apply(consoleObj, [ message ].concat(apiErrorObjs || []));
		}
	}

	if (!apiKey) {
		reportError("Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/");
		return {}; // an empty source to use instead. won't fetch anything.
	}

	// The API expects an ISO8601 datetime with a time and timezone part.
	// Since the calendar's timezone offset isn't always known, request the date in UTC and pad it by a day on each
	// side, guaranteeing we will receive all events in the desired range, albeit a superset.
	// .utc() will set a zone and give it a 00:00:00 time.
	if (!start.hasZone()) {
		start = start.clone().utc().add(-1, 'day');
	}
	if (!end.hasZone()) {
		end = end.clone().utc().add(1, 'day');
	}

	data = $.extend({}, sourceOptions.data || {}, {
		key: apiKey,
		timeMin: start.format(),
		timeMax: end.format(),
		singleEvents: true,
		maxResults: 9999
	});

	return $.extend({}, sourceOptions, {
		googleCalendarId: null, // prevents source-normalizing from happening again
		url: url,
		data: data,
		timezoneParam: 'timeZone',
		startParam: false, // `false` omits this parameter. we already included it above
		endParam: false, // same
		success: function(data) {
			var events = [];
			var successArgs;
			var successRes;

			if (data.error) {
				reportError('Google Calendar API: ' + data.error.message, data.error.errors);
			}
			else if (data.items) {
				$.each(data.items, function(i, entry) {
					events.push({
						id: entry.id,
						title: entry.summary,
						start: entry.start.dateTime || entry.start.date, // try timed. will fall back to all-day
						end: entry.end.dateTime || entry.end.date, // same
						url: entry.htmlLink,
						location: entry.location,
						description: entry.description
					});
				});

				// call the success handler(s) and allow it to return a new events array
				successArgs = [ events ].concat(Array.prototype.slice.call(arguments, 1)); // forward other jq args
				successRes = applyAll(success, this, successArgs);
				if ($.isArray(successRes)) {
					return successRes;
				}
			}

			return events;
		}
	});
}


});
