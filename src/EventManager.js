
var eventGUID = 1;

function EventManager(options, eventSources) {
	var t = this;
	
	
	// exports
	t.fetchEvents = fetchEvents;
	t.refetchEvents = refetchEvents;
	t.isFetchNeeded = isFetchNeeded;
	t.addEventSource = addEventSource;
	t.removeEventSource = removeEventSource;
	t.updateEvent = updateEvent;
	t.renderEvent = renderEvent;
	t.removeEvents = removeEvents;
	t.clientEvents = clientEvents;
	t.normalizeEvent = normalizeEvent;
	
	
	// imports
	var getDate = t.getDate;
	var getView = t.getView;
	var trigger = t.trigger;
	var rerenderEvents = t.rerenderEvents;

	
	// locals
	var eventStart, eventEnd;
	var events = [];
	var loadingLevel = 0;
	
	
	
	/* Sources
	-----------------------------------------------------------------------------*/
	
	
	eventSources.unshift([]); // first event source reserved for 'sticky' events
	

	function addEventSource(source) {
		eventSources.push(source);
		fetchEventSource(source, rerenderEvents);
	}
	

	function removeEventSource(source) {
		eventSources = $.grep(eventSources, function(src) {
			return src != source;
		});
		// remove all client events from that source
		events = $.grep(events, function(e) {
			return e.source != source;
		});
		rerenderEvents();
	}



	/* Fetching
	-----------------------------------------------------------------------------*/
	
	
	// Fetch from ALL sources. Clear 'events' array and populate
	function fetchEvents(callback) {
		var view = getView();
		events = [];
		eventStart = cloneDate(view.visStart);
		eventEnd = cloneDate(view.visEnd);
		var queued = eventSources.length,
			sourceDone = function() {
				if (!--queued) {
					if (callback) {
						callback(events);
					}
				}
			}, i=0;
		for (; i<eventSources.length; i++) {
			fetchEventSource(eventSources[i], sourceDone);
		}
	}
	
	
	// Fetch from a particular source. Append to the 'events' array
	function fetchEventSource(src, callback) {
		var prevView = getView(),
			prevDate = getDate(),
			reportEvents = function(a) {
				if (prevView == getView() && +prevDate == +getDate() && // protects from fast switching
					$.inArray(src, eventSources) != -1) {               // makes sure source hasn't been removed
						for (var i=0; i<a.length; i++) {
							normalizeEvent(a[i]);
							a[i].source = src;
						}
						events = events.concat(a);
						if (callback) {
							callback(a);
						}
					}
			},
			reportEventsAndPop = function(a) {
				reportEvents(a);
				popLoading();
			};
		if (typeof src == 'string') {
			var params = {};
			params[options.startParam] = Math.round(eventStart.getTime() / 1000);
			params[options.endParam] = Math.round(eventEnd.getTime() / 1000);
			if (options.cacheParam) {
				params[options.cacheParam] = (new Date()).getTime(); // TODO: deprecate cacheParam
			}
			pushLoading();
			// TODO: respect cache param in ajaxSetup
			$.ajax({
				url: src,
				dataType: 'json',
				data: params,
				cache: options.cacheParam || false, // don't let jquery prevent caching if cacheParam is being used
				success: reportEventsAndPop
			});
		}
		else if ($.isFunction(src)) {
			pushLoading();
			src(cloneDate(eventStart), cloneDate(eventEnd), reportEventsAndPop);
		}
		else {
			reportEvents(src); // src is an array
		}
	}
	
	
	function refetchEvents() {
		fetchEvents(rerenderEvents);
	}
	
	
	function isFetchNeeded() {
		var view = getView();
		return !eventStart || view.visStart < eventStart || view.visEnd > eventEnd;
	}
	
	
	
	/* Manipulation
	-----------------------------------------------------------------------------*/
	
	
	function updateEvent(event) { // update an existing event
		var i, len = events.length, e,
			defaultEventEnd = getView().defaultEventEnd,
			startDelta = event.start - event._start,
			endDelta = event.end ?
				(event.end - (event._end || defaultEventEnd(event))) // event._end would be null if event.end
				: 0;                                                      // was null and event was just resized
		for (i=0; i<len; i++) {
			e = events[i];
			if (e._id == event._id && e != event) {
				e.start = new Date(+e.start + startDelta);
				if (event.end) {
					if (e.end) {
						e.end = new Date(+e.end + endDelta);
					}else{
						e.end = new Date(+defaultEventEnd(e) + endDelta);
					}
				}else{
					e.end = null;
				}
				e.title = event.title;
				e.url = event.url;
				e.allDay = event.allDay;
				e.className = event.className;
				e.editable = event.editable;
				e.resizable = event.resizable;
				e.color = event.color;
				normalizeEvent(e);
			}
		}
		normalizeEvent(event);
		rerenderEvents();
	}
	
	
	function renderEvent(event, stick) { // render a new event
		normalizeEvent(event);
		if (!event.source) {
			if (stick) {
				(event.source = eventSources[0]).push(event);
			}
			events.push(event);
		}
		rerenderEvents();
	}
	
	
	function removeEvents(filter) {
		if (!filter) { // remove all
			events = [];
			// clear all array sources
			for (var i=0; i<eventSources.length; i++) {
				if (typeof eventSources[i] == 'object') {
					eventSources[i] = [];
				}
			}
		}else{
			if (!$.isFunction(filter)) { // an event ID
				var id = filter + '';
				filter = function(e) {
					return e._id == id;
				};
			}
			events = $.grep(events, filter, true);
			// remove events from array sources
			for (var i=0; i<eventSources.length; i++) {
				if (typeof eventSources[i] == 'object') {
					eventSources[i] = $.grep(eventSources[i], filter, true);
				}
			}
		}
		rerenderEvents();
	}
	
	
	function clientEvents(filter) {
		if ($.isFunction(filter)) {
			return $.grep(events, filter);
		}
		else if (filter) { // an event ID
			filter += '';
			return $.grep(events, function(e) {
				return e._id == filter;
			});
		}
		return events; // else, return all
	}
	
	
	
	/* Loading State
	-----------------------------------------------------------------------------*/
	
	
	function pushLoading() {
		if (!loadingLevel++) {
			trigger('loading', null, true);
		}
	}
	
	
	function popLoading() {
		if (!--loadingLevel) {
			trigger('loading', null, false);
		}
	}
	
	
	
	/* Event Normalization
	-----------------------------------------------------------------------------*/
	
	
	function normalizeEvent(event) {
		event._id = event._id || (event.id === undefined ? '_fc' + eventGUID++ : event.id + '');
		if (event.date) {
			if (!event.start) {
				event.start = event.date;
			}
			delete event.date;
		}
		event._start = cloneDate(event.start = parseDate(event.start));
		event.end = parseDate(event.end);
		if (event.end && event.end <= event.start) {
			event.end = null;
		}
		event._end = event.end ? cloneDate(event.end) : null;
		if (event.allDay === undefined) {
			event.allDay = options.allDayDefault;
		}
		if (event.className) {
			if (typeof event.className == 'string') {
				event.className = event.className.split(/\s+/);
			}
		}else{
			event.className = [];
		}
		// TODO: if there is no start date, return false to indicate an invalid event
	}


}
