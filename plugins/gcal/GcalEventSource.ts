import * as $ from 'jquery';
import { EventSource, Promise, JsonFeedEventSource, warn, applyAll } from 'fullcalendar';


export default class GcalEventSource extends EventSource {

	static API_BASE = 'https://www.googleapis.com/calendar/v3/calendars';

	// TODO: eventually remove "googleCalendar" prefix (API-breaking)
	googleCalendarApiKey: any
	googleCalendarId: any
	googleCalendarError: any // optional function
	ajaxSettings: any


	fetch(start, end, timezone) {
		var url = this.buildUrl();
		var requestParams = this.buildRequestParams(start, end, timezone);
		var ajaxSettings = this.ajaxSettings || {};
		var onSuccess = ajaxSettings.success;

		if (!requestParams) { // could have failed
			return Promise.reject();
		}

		this.calendar.pushLoading();

		return Promise.construct((onResolve, onReject) => {
			$.ajax($.extend(
				{}, // destination
				JsonFeedEventSource.AJAX_DEFAULTS,
				ajaxSettings,
				{
					url: url,
					data: requestParams,
					success: (responseData, status, xhr) => {
						var rawEventDefs;
						var successRes;

						this.calendar.popLoading();

						if (responseData.error) {
							this.reportError('Google Calendar API: ' + responseData.error.message, responseData.error.errors);
							onReject();
						}
						else if (responseData.items) {
							rawEventDefs = this.gcalItemsToRawEventDefs(
								responseData.items,
								requestParams.timeZone
							);

							successRes = applyAll(onSuccess, this, [ responseData, status, xhr ]); // passthru

							if ($.isArray(successRes)) {
								rawEventDefs = successRes;
							}

							onResolve(this.parseEventDefs(rawEventDefs));
						}
					}
				}
			));
		});
	}


	gcalItemsToRawEventDefs(items, gcalTimezone) {
		return items.map((item) => {
			return this.gcalItemToRawEventDef(item, gcalTimezone);
		});
	}


	gcalItemToRawEventDef(item, gcalTimezone) {
		var url = item.htmlLink || null;

		// make the URLs for each event show times in the correct timezone
		if (url && gcalTimezone) {
			url = injectQsComponent(url, 'ctz=' + gcalTimezone);
		}

		return {
			id: item.id,
			title: item.summary,
			start: item.start.dateTime || item.start.date, // try timed. will fall back to all-day
			end: item.end.dateTime || item.end.date, // same
			url: url,
			location: item.location,
			description: item.description
		};
	}


	buildUrl() {
		return GcalEventSource.API_BASE + '/' +
			encodeURIComponent(this.googleCalendarId) +
			'/events?callback=?'; // jsonp
	}


	buildRequestParams(start, end, timezone) {
		var apiKey = this.googleCalendarApiKey || this.calendar.opt('googleCalendarApiKey');
		var params;

		if (!apiKey) {
			this.reportError("Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/");
			return null;
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

		params = $.extend(
			this.ajaxSettings.data || {},
			{
				key: apiKey,
				timeMin: start.format(),
				timeMax: end.format(),
				singleEvents: true,
				maxResults: 9999
			}
		);

		if (timezone && timezone !== 'local') {
			// when sending timezone names to Google, only accepts underscores, not spaces
			params.timeZone = timezone.replace(' ', '_');
		}

		return params;
	}


	reportError(message, apiErrorObjs?) {
		var calendar = this.calendar;
		var calendarOnError = calendar.opt('googleCalendarError');
		var errorObjs = apiErrorObjs || [ { message: message } ]; // to be passed into error handlers

		if (this.googleCalendarError) {
			this.googleCalendarError.apply(calendar, errorObjs);
		}

		if (calendarOnError) {
			calendarOnError.apply(calendar, errorObjs);
		}

		// print error to debug console
		warn.apply(null, [ message ].concat(apiErrorObjs || []));
	}


	getPrimitive() {
		return this.googleCalendarId;
	}


	applyManualStandardProps(rawProps) {
		var superSuccess = EventSource.prototype.applyManualStandardProps.apply(this, arguments);
		var googleCalendarId = rawProps.googleCalendarId;

		if (googleCalendarId == null && rawProps.url) {
			googleCalendarId = parseGoogleCalendarId(rawProps.url);
		}

		if (googleCalendarId != null) {
			this.googleCalendarId = googleCalendarId;

			return superSuccess;
		}

		return false;
	}


	applyMiscProps(rawProps) {
		if (!this.ajaxSettings) {
			this.ajaxSettings = {};
		}
		$.extend(this.ajaxSettings, rawProps);
	}


	static parse(rawInput, calendar) {
		var rawProps;

		if (typeof rawInput === 'object') { // long form. might fail in applyManualStandardProps
			rawProps = rawInput;
		}
		else if (typeof rawInput === 'string') { // short form
			rawProps = { url: rawInput }; // url will be parsed with parseGoogleCalendarId
		}

		if (rawProps) {
			return EventSource.parse.call(this, rawProps, calendar);
		}

		return false;
	}

}


GcalEventSource.defineStandardProps({
	// manually process...
	url: false,
	googleCalendarId: false,

	// automatically transfer...
	googleCalendarApiKey: true,
	googleCalendarError: true
});


function parseGoogleCalendarId(url) {
	var match;

	// detect if the ID was specified as a single string.
	// will match calendars like "asdf1234@calendar.google.com" in addition to person email calendars.
	if (/^[^\/]+@([^\/\.]+\.)*(google|googlemail|gmail)\.com$/.test(url)) {
		return url;
	}
	// try to scrape it out of a V1 or V3 API feed URL
	else if (
		(match = /^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^\/]*)/.exec(url)) ||
		(match = /^https?:\/\/www.google.com\/calendar\/feeds\/([^\/]*)/.exec(url))
	) {
		return decodeURIComponent(match[1]);
	}
}


// Injects a string like "arg=value" into the querystring of a URL
function injectQsComponent(url, component) {
	// inject it after the querystring but before the fragment
	return url.replace(/(\?.*?)?(#|$)/, function(whole, qs, hash) {
		return (qs ? qs + '&' : '?') + component + hash;
	});
}
