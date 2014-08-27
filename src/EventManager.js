
fc.sourceNormalizers = [];
fc.sourceFetchers = [];

var ajaxDefaults = {
	dataType: 'json',
	cache: false
};

var eventGUID = 1;


function EventManager(options) { // assumed to be a calendar
	var t = this;
	
	
	// exports
	t.isFetchNeeded = isFetchNeeded;
	t.fetchEvents = fetchEvents;
	t.addEventSource = addEventSource;
	t.removeEventSource = removeEventSource;
	t.updateEvent = updateEvent;
	t.renderEvent = renderEvent;
	t.removeEvents = removeEvents;
	t.clientEvents = clientEvents;
	t.mutateEvent = mutateEvent;
	
	
	// imports
	var trigger = t.trigger;
	var getView = t.getView;
	var reportEvents = t.reportEvents;
	var getEventEnd = t.getEventEnd;
	
	
	// locals
	var stickySource = { events: [] };
	var sources = [ stickySource ];
	var rangeStart, rangeEnd;
	var currentFetchID = 0;
	var pendingSourceCnt = 0;
	var loadingLevel = 0;
	var cache = [];


	$.each(
		(options.events ? [ options.events ] : []).concat(options.eventSources || []),
		function(i, sourceInput) {
			var source = buildEventSource(sourceInput);
			if (source) {
				sources.push(source);
			}
		}
	);
	
	
	
	/* Fetching
	-----------------------------------------------------------------------------*/
	
	
	function isFetchNeeded(start, end) {
		return !rangeStart || // nothing has been fetched yet?
			// or, a part of the new range is outside of the old range? (after normalizing)
			start.clone().stripZone() < rangeStart.clone().stripZone() ||
			end.clone().stripZone() > rangeEnd.clone().stripZone();
	}
	
	
	function fetchEvents(start, end) {
		rangeStart = start;
		rangeEnd = end;
		cache = [];
		var fetchID = ++currentFetchID;
		var len = sources.length;
		pendingSourceCnt = len;
		for (var i=0; i<len; i++) {
			fetchEventSource(sources[i], fetchID);
		}
	}
	
	
	function fetchEventSource(source, fetchID) {
		_fetchEventSource(source, function(events) {
			var isArraySource = $.isArray(source.events);
			var i;
			var event;

			if (fetchID == currentFetchID) {

				if (events) {
					for (i=0; i<events.length; i++) {
						event = events[i];

						// event array sources have already been convert to Event Objects
						if (!isArraySource) {
							event = buildEvent(event, source);
						}

						if (event) {
							cache.push(event);
						}
					}
				}

				pendingSourceCnt--;
				if (!pendingSourceCnt) {
					reportEvents(cache);
				}
			}
		});
	}
	
	
	function _fetchEventSource(source, callback) {
		var i;
		var fetchers = fc.sourceFetchers;
		var res;

		for (i=0; i<fetchers.length; i++) {
			res = fetchers[i].call(
				t, // this, the Calendar object
				source,
				rangeStart.clone(),
				rangeEnd.clone(),
				options.timezone,
				callback
			);

			if (res === true) {
				// the fetcher is in charge. made its own async request
				return;
			}
			else if (typeof res == 'object') {
				// the fetcher returned a new source. process it
				_fetchEventSource(res, callback);
				return;
			}
		}

		var events = source.events;
		if (events) {
			if ($.isFunction(events)) {
				pushLoading();
				events.call(
					t, // this, the Calendar object
					rangeStart.clone(),
					rangeEnd.clone(),
					options.timezone,
					function(events) {
						callback(events);
						popLoading();
					}
				);
			}
			else if ($.isArray(events)) {
				callback(events);
			}
			else {
				callback();
			}
		}else{
			var url = source.url;
			if (url) {
				var success = source.success;
				var error = source.error;
				var complete = source.complete;

				// retrieve any outbound GET/POST $.ajax data from the options
				var customData;
				if ($.isFunction(source.data)) {
					// supplied as a function that returns a key/value object
					customData = source.data();
				}
				else {
					// supplied as a straight key/value object
					customData = source.data;
				}

				// use a copy of the custom data so we can modify the parameters
				// and not affect the passed-in object.
				var data = $.extend({}, customData || {});

				var startParam = firstDefined(source.startParam, options.startParam);
				var endParam = firstDefined(source.endParam, options.endParam);
				var timezoneParam = firstDefined(source.timezoneParam, options.timezoneParam);

				if (startParam) {
					data[startParam] = rangeStart.format();
				}
				if (endParam) {
					data[endParam] = rangeEnd.format();
				}
				if (options.timezone && options.timezone != 'local') {
					data[timezoneParam] = options.timezone;
				}

				pushLoading();
				$.ajax($.extend({}, ajaxDefaults, source, {
					data: data,
					success: function(events) {
						events = events || [];
						var res = applyAll(success, this, arguments);
						if ($.isArray(res)) {
							events = res;
						}
						callback(events);
					},
					error: function() {
						applyAll(error, this, arguments);
						callback();
					},
					complete: function() {
						applyAll(complete, this, arguments);
						popLoading();
					}
				}));
			}else{
				callback();
			}
		}
	}
	
	
	
	/* Sources
	-----------------------------------------------------------------------------*/
	

	function addEventSource(sourceInput) {
		var source = buildEventSource(sourceInput);
		if (source) {
			sources.push(source);
			pendingSourceCnt++;
			fetchEventSource(source, currentFetchID); // will eventually call reportEvents
		}
	}


	function buildEventSource(sourceInput) { // will return undefined if invalid source
		var normalizers = fc.sourceNormalizers;
		var source;
		var i;

		if ($.isFunction(sourceInput) || $.isArray(sourceInput)) {
			source = { events: sourceInput };
		}
		else if (typeof sourceInput === 'string') {
			source = { url: sourceInput };
		}
		else if (typeof sourceInput === 'object') {
			source = $.extend({}, sourceInput); // shallow copy
		}

		if (source) {

			// TODO: repeat code, same code for event classNames
			if (source.className) {
				if (typeof source.className === 'string') {
					source.className = source.className.split(/\s+/);
				}
				// otherwise, assumed to be an array
			}
			else {
				source.className = [];
			}

			// for array sources, we convert to standard Event Objects up front
			if ($.isArray(source.events)) {
				source.origArray = source.events; // for removeEventSource
				source.events = $.map(source.events, function(eventInput) {
					return buildEvent(eventInput, source);
				});
			}

			for (i=0; i<normalizers.length; i++) {
				normalizers[i].call(t, source);
			}

			return source;
		}
	}


	function removeEventSource(source) {
		sources = $.grep(sources, function(src) {
			return !isSourcesEqual(src, source);
		});
		// remove all client events from that source
		cache = $.grep(cache, function(e) {
			return !isSourcesEqual(e.source, source);
		});
		reportEvents(cache);
	}


	function isSourcesEqual(source1, source2) {
		return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
	}


	function getSourcePrimitive(source) {
		return (
			(typeof source === 'object') ? // a normalized event source?
				(source.origArray || source.url || source.events) : // get the primitive
				null
		) ||
		source; // the given argument *is* the primitive
	}
	
	
	
	/* Manipulation
	-----------------------------------------------------------------------------*/


	function updateEvent(event) {

		event.start = t.moment(event.start);
		if (event.end) {
			event.end = t.moment(event.end);
		}

		mutateEvent(event);
		propagateMiscProperties(event);
		reportEvents(cache); // reports event modifications (so we can redraw)
	}


	var miscCopyableProps = [
		'title',
		'url',
		'allDay',
		'className',
		'editable',
		'color',
		'backgroundColor',
		'borderColor',
		'textColor'
	];

	function propagateMiscProperties(event) {
		var i;
		var cachedEvent;
		var j;
		var prop;

		for (i=0; i<cache.length; i++) {
			cachedEvent = cache[i];
			if (cachedEvent._id == event._id && cachedEvent !== event) {
				for (j=0; j<miscCopyableProps.length; j++) {
					prop = miscCopyableProps[j];
					if (event[prop] !== undefined) {
						cachedEvent[prop] = event[prop];
					}
				}
			}
		}
	}

	
	
	function renderEvent(eventData, stick) {
		var event = buildEvent(eventData);
		if (event) {
			if (!event.source) {
				if (stick) {
					stickySource.events.push(event);
					event.source = stickySource;
				}
				cache.push(event);
			}
			reportEvents(cache);
		}
	}
	
	
	function removeEvents(filter) {
		var eventID;
		var i;

		if (filter == null) { // null or undefined. remove all events
			filter = function() { return true; }; // will always match
		}
		else if (!$.isFunction(filter)) { // an event ID
			eventID = filter + '';
			filter = function(event) {
				return event._id == eventID;
			};
		}

		// Purge event(s) from our local cache
		cache = $.grep(cache, filter, true); // inverse=true

		// Remove events from array sources.
		// This works because they have been converted to official Event Objects up front.
		// (and as a result, event._id has been calculated).
		for (i=0; i<sources.length; i++) {
			if ($.isArray(sources[i].events)) {
				sources[i].events = $.grep(sources[i].events, filter, true);
			}
		}

		reportEvents(cache);
	}
	
	
	function clientEvents(filter) {
		if ($.isFunction(filter)) {
			return $.grep(cache, filter);
		}
		else if (filter != null) { // not null, not undefined. an event ID
			filter += '';
			return $.grep(cache, function(e) {
				return e._id == filter;
			});
		}
		return cache; // else, return all
	}
	
	
	
	/* Loading State
	-----------------------------------------------------------------------------*/
	
	
	function pushLoading() {
		if (!(loadingLevel++)) {
			trigger('loading', null, true, getView());
		}
	}
	
	
	function popLoading() {
		if (!(--loadingLevel)) {
			trigger('loading', null, false, getView());
		}
	}
	
	
	
	/* Event Normalization
	-----------------------------------------------------------------------------*/

	function buildEvent(data, source) { // source may be undefined!
		var out = {};
		var start;
		var end;
		var allDay;
		var allDayDefault;

		if (options.eventDataTransform) {
			data = options.eventDataTransform(data);
		}
		if (source && source.eventDataTransform) {
			data = source.eventDataTransform(data);
		}

		start = t.moment(data.start || data.date); // "date" is an alias for "start"
		if (!start.isValid()) {
			return;
		}

		end = null;
		if (data.end) {
			end = t.moment(data.end);
			if (!end.isValid()) {
				return;
			}
		}

		allDay = data.allDay;
		if (allDay === undefined) {
			allDayDefault = firstDefined(
				source ? source.allDayDefault : undefined,
				options.allDayDefault
			);
			if (allDayDefault !== undefined) {
				// use the default
				allDay = allDayDefault;
			}
			else {
				// all dates need to have ambig time for the event to be considered allDay
				allDay = !start.hasTime() && (!end || !end.hasTime());
			}
		}

		// normalize the date based on allDay
		if (allDay) {
			// neither date should have a time
			if (start.hasTime()) {
				start.stripTime();
			}
			if (end && end.hasTime()) {
				end.stripTime();
			}
		}
		else {
			// force a time/zone up the dates
			if (!start.hasTime()) {
				start = t.rezoneDate(start);
			}
			if (end && !end.hasTime()) {
				end = t.rezoneDate(end);
			}
		}

		// Copy all properties over to the resulting object.
		// The special-case properties will be copied over afterwards.
		$.extend(out, data);

		if (source) {
			out.source = source;
		}

		out._id = data._id || (data.id === undefined ? '_fc' + eventGUID++ : data.id + '');

		if (data.className) {
			if (typeof data.className == 'string') {
				out.className = data.className.split(/\s+/);
			}
			else { // assumed to be an array
				out.className = data.className;
			}
		}
		else {
			out.className = [];
		}

		out.allDay = allDay;
		out.start = start;
		out.end = end;

		if (options.forceEventDuration && !out.end) {
			out.end = getEventEnd(out);
		}

		backupEventDates(out);

		return out;
	}



	/* Event Modification Math
	-----------------------------------------------------------------------------------------*/


	// Modify the date(s) of an event and make this change propagate to all other events with
	// the same ID (related repeating events).
	//
	// If `newStart`/`newEnd` are not specified, the "new" dates are assumed to be `event.start` and `event.end`.
	// The "old" dates to be compare against are always `event._start` and `event._end` (set by EventManager).
	//
	// Returns an object with delta information and a function to undo all operations.
	//
	function mutateEvent(event, newStart, newEnd) {
		var oldAllDay = event._allDay;
		var oldStart = event._start;
		var oldEnd = event._end;
		var clearEnd = false;
		var newAllDay;
		var dateDelta;
		var durationDelta;
		var undoFunc;

		// if no new dates were passed in, compare against the event's existing dates
		if (!newStart && !newEnd) {
			newStart = event.start;
			newEnd = event.end;
		}

		// NOTE: throughout this function, the initial values of `newStart` and `newEnd` are
		// preserved. These values may be undefined.

		// detect new allDay
		if (event.allDay != oldAllDay) { // if value has changed, use it
			newAllDay = event.allDay;
		}
		else { // otherwise, see if any of the new dates are allDay
			newAllDay = !(newStart || newEnd).hasTime();
		}

		// normalize the new dates based on allDay
		if (newAllDay) {
			if (newStart) {
				newStart = newStart.clone().stripTime();
			}
			if (newEnd) {
				newEnd = newEnd.clone().stripTime();
			}
		}

		// compute dateDelta
		if (newStart) {
			if (newAllDay) {
				dateDelta = dayishDiff(newStart, oldStart.clone().stripTime()); // treat oldStart as allDay
			}
			else {
				dateDelta = dayishDiff(newStart, oldStart);
			}
		}

		if (newAllDay != oldAllDay) {
			// if allDay has changed, always throw away the end
			clearEnd = true;
		}
		else if (newEnd) {
			durationDelta = dayishDiff(
				// new duration
				newEnd || t.getDefaultEventEnd(newAllDay, newStart || oldStart),
				newStart || oldStart
			).subtract(dayishDiff(
				// subtract old duration
				oldEnd || t.getDefaultEventEnd(oldAllDay, oldStart),
				oldStart
			));
		}

		undoFunc = mutateEvents(
			clientEvents(event._id), // get events with this ID
			clearEnd,
			newAllDay,
			dateDelta,
			durationDelta
		);

		return {
			dateDelta: dateDelta,
			durationDelta: durationDelta,
			undo: undoFunc
		};
	}


	// Modifies an array of events in the following ways (operations are in order):
	// - clear the event's `end`
	// - convert the event to allDay
	// - add `dateDelta` to the start and end
	// - add `durationDelta` to the event's duration
	//
	// Returns a function that can be called to undo all the operations.
	//
	function mutateEvents(events, clearEnd, forceAllDay, dateDelta, durationDelta) {
		var isAmbigTimezone = t.getIsAmbigTimezone();
		var undoFunctions = [];

		$.each(events, function(i, event) {
			var oldAllDay = event._allDay;
			var oldStart = event._start;
			var oldEnd = event._end;
			var newAllDay = forceAllDay != null ? forceAllDay : oldAllDay;
			var newStart = oldStart.clone();
			var newEnd = (!clearEnd && oldEnd) ? oldEnd.clone() : null;

			// NOTE: this function is responsible for transforming `newStart` and `newEnd`,
			// which were initialized to the OLD values first. `newEnd` may be null.

			// normlize newStart/newEnd to be consistent with newAllDay
			if (newAllDay) {
				newStart.stripTime();
				if (newEnd) {
					newEnd.stripTime();
				}
			}
			else {
				if (!newStart.hasTime()) {
					newStart = t.rezoneDate(newStart);
				}
				if (newEnd && !newEnd.hasTime()) {
					newEnd = t.rezoneDate(newEnd);
				}
			}

			// ensure we have an end date if necessary
			if (!newEnd && (options.forceEventDuration || +durationDelta)) {
				newEnd = t.getDefaultEventEnd(newAllDay, newStart);
			}

			// translate the dates
			newStart.add(dateDelta);
			if (newEnd) {
				newEnd.add(dateDelta).add(durationDelta);
			}

			// if the dates have changed, and we know it is impossible to recompute the
			// timezone offsets, strip the zone.
			if (isAmbigTimezone) {
				if (+dateDelta || +durationDelta) {
					newStart.stripZone();
					if (newEnd) {
						newEnd.stripZone();
					}
				}
			}

			event.allDay = newAllDay;
			event.start = newStart;
			event.end = newEnd;
			backupEventDates(event);

			undoFunctions.push(function() {
				event.allDay = oldAllDay;
				event.start = oldStart;
				event.end = oldEnd;
				backupEventDates(event);
			});
		});

		return function() {
			for (var i=0; i<undoFunctions.length; i++) {
				undoFunctions[i]();
			}
		};
	}

}


// updates the "backup" properties, which are preserved in order to compute diffs later on.
function backupEventDates(event) {
	event._allDay = event.allDay;
	event._start = event.start.clone();
	event._end = event.end ? event.end.clone() : null;
}
