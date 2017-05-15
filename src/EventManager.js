
FC.sourceNormalizers = [];
FC.sourceFetchers = [];

var ajaxDefaults = {
	dataType: 'json',
	cache: false
};

var eventGUID = 1;


function EventManager() { // assumed to be a calendar
	var t = this;


	// exports
	t.requestEvents = requestEvents;
	t.reportEventChange = reportEventChange;
	t.isFetchNeeded = isFetchNeeded;
	t.fetchEvents = fetchEvents;
	t.fetchEventSources = fetchEventSources;
	t.refetchEvents = refetchEvents;
	t.refetchEventSources = refetchEventSources;
	t.getEventSources = getEventSources;
	t.getEventSourceById = getEventSourceById;
	t.addEventSource = addEventSource;
	t.removeEventSource = removeEventSource;
	t.removeEventSources = removeEventSources;
	t.updateEvent = updateEvent;
	t.updateEvents = updateEvents;
	t.renderEvent = renderEvent;
	t.renderEvents = renderEvents;
	t.removeEvents = removeEvents;
	t.clientEvents = clientEvents;


	// locals
	var stickySource = { events: [] };
	var sources = [ stickySource ];
	var rangeStart, rangeEnd;
	var pendingSourceCnt = 0; // outstanding fetch requests, max one per source
	var cache = []; // holds events that have already been expanded
	var eventDefCollection = new EventDefinitionCollection(t);
	t.eventDefCollection = eventDefCollection;

	var currentRenderRanges;


	$.each(
		(t.opt('events') ? [ t.opt('events') ] : []).concat(t.opt('eventSources') || []),
		function(i, sourceInput) {
			var source = buildEventSource(sourceInput);
			if (source) {
				sources.push(source);
			}
		}
	);



	function requestEvents(start, end) {
		if (!t.opt('lazyFetching') || isFetchNeeded(start, end)) {
			return fetchEvents(start, end);
		}
		else {
			currentRenderRanges = eventDefCollection.buildRenderRanges(rangeStart, rangeEnd, t);
			return Promise.resolve(currentRenderRanges);
		}
	}


	function reportEventChange() {
		currentRenderRanges = eventDefCollection.buildRenderRanges(rangeStart, rangeEnd, t);
		t.trigger('eventsReset', currentRenderRanges);
	}


	t.getEventCache = function() {
		return cache;
	};



	/* Fetching
	-----------------------------------------------------------------------------*/


	// start and end are assumed to be unzoned
	function isFetchNeeded(start, end) {
		return !rangeStart || // nothing has been fetched yet?
			start < rangeStart || end > rangeEnd; // is part of the new range outside of the old range?
	}


	function fetchEvents(start, end) {
		rangeStart = start;
		rangeEnd = end;
		return refetchEvents();
	}


	// poorly named. fetches all sources with current `rangeStart` and `rangeEnd`.
	function refetchEvents() {
		return fetchEventSources(sources, 'reset');
	}


	// poorly named. fetches a subset of event sources.
	function refetchEventSources(matchInputs) {
		return fetchEventSources(getEventSourcesByMatchArray(matchInputs));
	}


	// expects an array of event source objects (the originals, not copies)
	// `specialFetchType` is an optimization parameter that affects purging of the event cache.
	function fetchEventSources(specificSources, specialFetchType) {
		var i, source;

		if (specialFetchType === 'reset') {
			cache = [];
			eventDefCollection.clear();
		}
		else if (specialFetchType !== 'add') {
			cache = excludeEventsBySources(cache, specificSources);
			eventDefCollection.clearBySource(specificSources);
		}

		for (i = 0; i < specificSources.length; i++) {
			source = specificSources[i];

			// already-pending sources have already been accounted for in pendingSourceCnt
			if (source._status !== 'pending') {
				pendingSourceCnt++;
			}

			source._fetchId = (source._fetchId || 0) + 1;
			source._status = 'pending';
		}

		for (i = 0; i < specificSources.length; i++) {
			source = specificSources[i];
			tryFetchEventSource(source, source._fetchId);
		}

		if (pendingSourceCnt) {
			return Promise.construct(function(resolve) {
				t.one('eventsReceived', resolve);
			});
		}
		else { // executed all synchronously, or no sources at all
			return Promise.resolve(eventDefCollection.buildRenderRanges(rangeStart, rangeEnd, t));
		}
	}


	// fetches an event source and processes its result ONLY if it is still the current fetch.
	// caller is responsible for incrementing pendingSourceCnt first.
	function tryFetchEventSource(source, fetchId) {
		_fetchEventSource(source, function(eventInputs) {
			var isArraySource = $.isArray(source.events);
			var i, eventInput;
			var eventDef;

			if (
				// is this the source's most recent fetch?
				// if not, rely on an upcoming fetch of this source to decrement pendingSourceCnt
				fetchId === source._fetchId &&
				// event source no longer valid?
				source._status !== 'rejected'
			) {
				source._status = 'resolved';

				if (eventInputs) {

					for (i = 0; i < eventInputs.length; i++) {
						eventInput = eventInputs[i];

						if (isArraySource) { // array sources have already been convert to Event Objects
							eventDef = eventInput;
						}
						else {
							eventDef = parseEventInput(eventInput, source, t);
						}

						if (eventDef) { // not invalid
							eventDefCollection.add(eventDef);
						}
					}
				}

				decrementPendingSourceCnt();
			}
		});
	}


	function rejectEventSource(source) {
		var wasPending = source._status === 'pending';

		source._status = 'rejected';

		if (wasPending) {
			decrementPendingSourceCnt();
		}
	}


	function decrementPendingSourceCnt() {
		pendingSourceCnt--;
		if (!pendingSourceCnt) {
			reportEventChange(); // populates currentRenderRanges
			t.trigger('eventsReceived', currentRenderRanges);
		}
	}


	function _fetchEventSource(source, callback) {
		var i;
		var fetchers = FC.sourceFetchers;
		var res;

		for (i=0; i<fetchers.length; i++) {
			res = fetchers[i].call(
				t, // this, the Calendar object
				source,
				rangeStart.clone(),
				rangeEnd.clone(),
				t.opt('timezone'),
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
				t.pushLoading();
				events.call(
					t, // this, the Calendar object
					rangeStart.clone(),
					rangeEnd.clone(),
					t.opt('timezone'),
					function(events) {
						callback(events);
						t.popLoading();
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

				var startParam = firstDefined(source.startParam, t.opt('startParam'));
				var endParam = firstDefined(source.endParam, t.opt('endParam'));
				var timezoneParam = firstDefined(source.timezoneParam, t.opt('timezoneParam'));

				if (startParam) {
					data[startParam] = rangeStart.format();
				}
				if (endParam) {
					data[endParam] = rangeEnd.format();
				}
				if (t.opt('timezone') && t.opt('timezone') != 'local') {
					data[timezoneParam] = t.opt('timezone');
				}

				t.pushLoading();
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
						t.popLoading();
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
			fetchEventSources([ source ], 'add'); // will eventually call reportEventChange
		}
	}


	function buildEventSource(sourceInput) { // will return undefined if invalid source
		var normalizers = FC.sourceNormalizers;
		var source;
		var i;
		var eventDef;

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
				source.events = [];

				for (i = 0; i < source.origArray.length; i++) {
					eventDef = parseEventInput(
						source.origArray[i],
						source,
						t // calendar
					);

					if (eventDef) { // not invalid
						source.events.push(eventDef);
					}
				}
			}

			for (i = 0; i < normalizers.length; i++) {
				normalizers[i].call(t, source);
			}

			return source;
		}
	}


	function removeEventSource(matchInput) {
		removeSpecificEventSources(
			getEventSourcesByMatch(matchInput)
		);
	}


	// if called with no arguments, removes all.
	function removeEventSources(matchInputs) {
		if (matchInputs == null) {
			removeSpecificEventSources(sources, true); // isAll=true
		}
		else {
			removeSpecificEventSources(
				getEventSourcesByMatchArray(matchInputs)
			);
		}
	}


	function removeSpecificEventSources(targetSources, isAll) {
		var i;

		// cancel pending requests
		for (i = 0; i < targetSources.length; i++) {
			rejectEventSource(targetSources[i]);
		}

		if (isAll) { // an optimization
			sources = [];
			cache = [];
			eventDefCollection.clear();
		}
		else {
			// remove from persisted source list
			sources = $.grep(sources, function(source) {
				for (i = 0; i < targetSources.length; i++) {
					if (source === targetSources[i]) {
						return false; // exclude
					}
				}
				return true; // include
			});

			cache = excludeEventsBySources(cache, targetSources);
			eventDefCollection.clearBySource(targetSources);
		}

		reportEventChange();
	}


	function getEventSources() {
		return sources.slice(1); // returns a shallow copy of sources with stickySource removed
	}


	function getEventSourceById(id) {
		return $.grep(sources, function(source) {
			return source.id && source.id === id;
		})[0];
	}


	// like getEventSourcesByMatch, but accepts multple match criteria (like multiple IDs)
	function getEventSourcesByMatchArray(matchInputs) {

		// coerce into an array
		if (!matchInputs) {
			matchInputs = [];
		}
		else if (!$.isArray(matchInputs)) {
			matchInputs = [ matchInputs ];
		}

		var matchingSources = [];
		var i;

		// resolve raw inputs to real event source objects
		for (i = 0; i < matchInputs.length; i++) {
			matchingSources.push.apply( // append
				matchingSources,
				getEventSourcesByMatch(matchInputs[i])
			);
		}

		return matchingSources;
	}


	// matchInput can either by a real event source object, an ID, or the function/URL for the source.
	// returns an array of matching source objects.
	function getEventSourcesByMatch(matchInput) {
		var i, source;

		// given an proper event source object
		for (i = 0; i < sources.length; i++) {
			source = sources[i];
			if (source === matchInput) {
				return [ source ];
			}
		}

		// an ID match
		source = getEventSourceById(matchInput);
		if (source) {
			return [ source ];
		}

		return $.grep(sources, function(source) {
			return isSourcesEquivalent(matchInput, source);
		});
	}


	function isSourcesEquivalent(source1, source2) {
		return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
	}


	function getSourcePrimitive(source) {
		return (
			(typeof source === 'object') ? // a normalized event source?
				(source.origArray || source.googleCalendarId || source.url || source.events) : // get the primitive
				null
		) ||
		source; // the given argument *is* the primitive
	}


	// util
	// returns a filtered array without events that are part of any of the given sources
	function excludeEventsBySources(specificEvents, specificSources) {
		return $.grep(specificEvents, function(event) {
			for (var i = 0; i < specificSources.length; i++) {
				if (event.source === specificSources[i]) {
					return false; // exclude
				}
			}
			return true; // keep
		});
	}



	/* Manipulation
	-----------------------------------------------------------------------------*/


	// Only ever called from the externally-facing API
	function updateEvent(eventProps) {
		updateEvents([ eventProps ]);
	}


	// Only ever called from the externally-facing API
	function updateEvents(eventPropsArray) {
		var i, eventProps;
		var eventDef;
		var eventInstance;
		var eventMutation;

		for (i = 0; i < eventPropsArray.length; i++) {
			eventProps = eventPropsArray[i];

			eventDef = eventDefCollection.getById(eventProps._id);
			eventInstance = eventDef.buildInstances()[0];
			eventMutation = EventMutation.createFromRawProps(
				eventInstance,
				eventProps, // raw props
				null, // largeUnit -- who uses it?
				t // calendar
			);

			eventMutation.mutateSingleEventDefinition(eventDef, t); // calendar=t
		}

		reportEventChange(); // reports event modifications (so we can redraw)
	}


	// CHANGELOG: note how it does not return objects anymore
	// called from public API only
	function renderEvent(eventInput, isSticky) {
		renderEvents([ eventInput ], isSticky);
	}


	// CHANGELOG: note how it does not return objects anymore
	// called from public API only
	function renderEvents(eventInputs, isSticky) {
		var i;
		var eventDef;
		var successCnt = 0;

		for (i = 0; i < eventInputs.length; i++) {

			eventDef = parseEventInput(eventInputs[i], stickySource, t);

			if (eventDef) { // not invalid
				addEventDef(eventDef, isSticky);
				successCnt++;
			}
		}

		if (successCnt) { // any new events rendered?
			reportEventChange();
		}
	}


	t.addEventDefAndRender = function(eventDef, isSticky) {
		addEventDef(eventDef, isSticky);
		reportEventChange();
	};


	function addEventDef(eventDef, isSticky) {
		eventDefCollection.add(eventDef);

		if (isSticky) {
			// will cause the addition to persist
			stickySource.events.push(eventDef);
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
		eventDefCollection.clearByFilter(filter);

		// Remove events from array sources.
		// This works because they have been converted to official Event Objects up front.
		// (and as a result, event._id has been calculated).
		for (i=0; i<sources.length; i++) {
			if ($.isArray(sources[i].events)) {
				sources[i].events = $.grep(sources[i].events, filter, true);
			}
		}

		reportEventChange();
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


	// Makes sure all array event sources have their internal event objects
	// converted over to the Calendar's current timezone.
	// TODO: operate on EventDefs
	t.rezoneArrayEventSources = function() {
		var i;
		var eventDefs;
		var j;

		for (i = 0; i < sources.length; i++) {
			eventDefs = sources[i].eventDefs;

			if ($.isArray(eventDefs)) {

				for (j = 0; j < eventDefs.length; j++) {
					rezoneEventDates(eventDefs[j]);
				}
			}
		}
	};

	function rezoneEventDates(eventDef) {
		if (eventDef instanceof SingleEventDefinition) {

			eventDef.start = t.moment(eventDef.start);

			if (eventDef.end) {
				eventDef.end = t.moment(eventDef.end);
			}
		}
	}

}


Calendar.prototype.mutateEventsWithId = function(id, eventMutation) {
	var eventDefs = this.eventDefCollection.getById(id);
	var i;
	var undoFuncs = [];

	for (i = 0; i < eventDefs.length; i++) {
		if (eventDefs[i] instanceof SingleEventDefinition) {
			undoFuncs.push(
				eventMutation.mutateSingleEventDefinition(
					eventDefs[i],
					this // calendar
				)
			);
		}
	}

	return function() {
		for (var i = 0; i < undoFuncs.length; i++) {
			undoFuncs[i]();
		}
	};
};


// hook for external libs to manipulate event properties upon creation.
// should manipulate the event in-place.
Calendar.prototype.normalizeEvent = function(event) {
};


Calendar.prototype.buildMutatedEventInstanceGroup = function(eventId, eventMutation) {
	var viewRange = this.getView().activeRange;
	var defs = this.eventDefCollection.getById(eventId);
	var i;
	var defCopy;
	var allInstances = [];

	for (i = 0; i < defs.length; i++) {
		defCopy = defs[i].clone();

		if (defCopy instanceof SingleEventDefinition) {

			eventMutation.mutateSingleEventDefinition(defCopy, this); // calendar=this

			allInstances.push.apply(allInstances, // append
				defCopy.buildInstances(viewRange.start, viewRange.end)
			);
		}
	}

	return new EventInstanceGroup(allInstances);
};
