
var eventGUID = 1;

function EventManager(options, sources) {
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
	t.normalizeEvent = normalizeEvent;
	
	
	// imports
	var trigger = t.trigger;
	var getView = t.getView;
	var reportEvents = t.reportEvents;
	
	
	// locals
	var rangeStart, rangeEnd;
	var currentFetchID = 0;
	var pendingSourceCnt = 0;
	var loadingLevel = 0;
	var dynamicEventSource = [];
	var cache = [];
	
	
	
	/* Fetching
	-----------------------------------------------------------------------------*/
	
	
	function isFetchNeeded(start, end) {
		return !rangeStart || start < rangeStart || end > rangeEnd;
	}
	
	
	function fetchEvents(start, end) {
		rangeStart = start;
		rangeEnd = end;
		currentFetchID++;
		cache = [];
		pendingSourceCnt = sources.length;
		for (var i=0; i<sources.length; i++) {
			fetchEventSource(sources[i], currentFetchID);
		}
	}
	
	
	function fetchEventSource(source, fetchID) {
		_fetchEventSource(source, function(events) {
			if (fetchID == currentFetchID) {
				for (var i=0; i<events.length; i++) {
					normalizeEvent(events[i]);
					events[i].source = source;
				}
				cache = cache.concat(events);
				pendingSourceCnt--;
				if (!pendingSourceCnt) {
					reportEvents(cache);
				}
			}
		});
	}
	
	
	function _fetchEventSource(source, callback) {
		if (typeof source == 'string') {
			var params = {};
			params[options.startParam] = Math.round(rangeStart.getTime() / 1000);
			params[options.endParam] = Math.round(rangeEnd.getTime() / 1000);
			if (options.cacheParam) {
				params[options.cacheParam] = (new Date()).getTime(); // TODO: deprecate cacheParam
			}
			pushLoading();
			// TODO: respect cache param in ajaxSetup
			$.ajax({
				url: source,
				dataType: 'json',
				data: params,
				cache: options.cacheParam || false, // don't let jquery prevent caching if cacheParam is being used
				success: function(events) {
					popLoading();
					callback(events);
				}
			});
		}
		else if ($.isFunction(source)) {
			pushLoading();
			source(cloneDate(rangeStart), cloneDate(rangeEnd), function(events) {
				popLoading();
				callback(events);
			});
		}
		else {
			callback(source); // src is an array
		}
	}
	
	
	
	/* Sources
	-----------------------------------------------------------------------------*/
	
	
	sources.push(dynamicEventSource);
	

	function addEventSource(source) {
		sources.push(source);
		pendingSourceCnt++;
		fetchEventSource(source, currentFetchID); // will eventually call reportEvents
	}
	

	function removeEventSource(source) {
		sources = $.grep(sources, function(src) {
			return src != source;
		});
		// remove all client events from that source
		cache = $.grep(cache, function(e) {
			return e.source != source;
		});
		reportEvents(cache);
	}
	
	
	
	/* Manipulation
	-----------------------------------------------------------------------------*/
	
	
	function updateEvent(event) { // update an existing event
		var i, len = cache.length, e,
			defaultEventEnd = getView().defaultEventEnd, // getView???
			startDelta = event.start - event._start,
			endDelta = event.end ?
				(event.end - (event._end || defaultEventEnd(event))) // event._end would be null if event.end
				: 0;                                                      // was null and event was just resized
		for (i=0; i<len; i++) {
			e = cache[i];
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
				normalizeEvent(e);
			}
		}
		normalizeEvent(event);
		reportEvents(cache);
	}
	
	
	function renderEvent(event, stick) {
		normalizeEvent(event);
		if (!event.source) {
			if (stick) {
				dynamicEventSource.push(event);
				event.source = dynamicEventSource;
			}
			cache.push(event);
		}
		reportEvents(cache);
	}
	
	
	function removeEvents(filter) {
		if (!filter) { // remove all
			cache = [];
			// clear all array sources
			for (var i=0; i<sources.length; i++) {
				if (typeof sources[i] == 'object') {
					sources[i] = [];
				}
			}
		}else{
			if (!$.isFunction(filter)) { // an event ID
				var id = filter + '';
				filter = function(e) {
					return e._id == id;
				};
			}
			cache = $.grep(cache, filter, true);
			// remove events from array sources
			for (var i=0; i<sources.length; i++) {
				if (typeof sources[i] == 'object') {
					sources[i] = $.grep(sources[i], filter, true);
				}
			}
		}
		reportEvents(cache);
	}
	
	
	function clientEvents(filter) {
		if ($.isFunction(filter)) {
			return $.grep(cache, filter);
		}
		else if (filter) { // an event ID
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
		event._start = cloneDate(event.start = parseDate(event.start, options.ignoreTimezone));
		event.end = parseDate(event.end, options.ignoreTimezone);
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
