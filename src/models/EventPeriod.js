
var EventPeriod = Class.extend(EmitterMixin, {

	start: null,
	end: null,
	timezone: null,

	requests: null,
	pendingCnt: 0,

	freezeDepth: 0,
	stuntedReleaseCnt: 0,
	releaseCnt: 0,

	eventDefsById: null,
	eventInstancesById: null,
	eventRangesById: null,


	constructor: function(start, end, timezone) {
		this.start = start;
		this.end = end;
		this.timezone = timezone;
		this.requests = [];
		this.eventDefsById = {};
		this.eventInstancesById = {};
		this.eventRangesById = {};
	},


	isWithinRange: function(start, end) {
		// TODO: use a range util function?
		return !start.isBefore(this.start) && !end.isAfter(this.end);
	},


	// Requesting and Purging
	// -----------------------------------------------------------------------------------------------------------------


	requestSources: function(sources) {
		this.freeze();

		for (var i = 0; i < sources.length; i++) {
			this.requestSource(sources[i]);
		}

		this.thaw();
	},


	requestSource: function(source) {
		var _this = this;
		var request = { source: source, status: 'pending' };

		this.requests.push(request);
		this.pendingCnt += 1;

		source.fetch(this.start, this.end, this.timezone).then(function(eventDefs) {
			if (request.status !== 'cancelled') {
				_this.addEventDefs(eventDefs);
				_this.pendingCnt--;
				_this.tryRelease();
			}
		});
	},


	purgeSource: function(source, isSilent) {
		var _this = this;

		var removeCnt = removeMatching(this.requests, function(request) {
			if (request.source === source) {
				if (request.status === 'pending') {
					_this.pendingCnt--; // removeEventBySource might trigger the release
				}
				request.status = 'cancelled';
				return true; // remove from the array
			}
		});

		if (removeCnt) {
			this.removeEventsBySource(source, isSilent); // might release
		}

		return removeCnt;
	},


	purgeAllSources: function(isSilent) {
		if (this.requests.length) {
			this.requests.forEach(function(request) {
				request.status = 'cancelled';
			});

			this.requests = [];
			this.pendingCnt = 0;
			this.removeAllEvents(isSilent); // might release
		}
	},


	// Event Def/Instance/Range ADDING
	// -----------------------------------------------------------------------------------------------------------------


	addEventDefs: function(eventDefs) {
		for (var i = 0; i < eventDefs.length; i++) {
			this.addEventDef(eventDefs[i]);
		}
	},


	addEventDef: function(eventDef) {
		var eventDefsById = this.eventDefsById;
		var eventDefId = eventDef.id;
		var eventInstances = eventDef.buildInstances(this.start, this.end);
		var i;

		(eventDefsById[eventDefId] || (eventDefsById[eventDefId] = []))
			.push(eventDef);

		for (i = 0; i < eventInstances.length; i++) {
			this.addEventInstance(eventInstances[i], eventDefId);
		}
	},


	addEventInstance: function(eventInstance, eventDefId) {
		var eventInstancesById = this.eventInstancesById;

		(eventInstancesById[eventDefId] || (eventInstancesById[eventDefId] = []))
			.push(eventInstance);

		this.addEventRange(eventInstance.buildEventRange(), eventDefId);
	},


	addEventRange: function(eventRange, eventDefId) {
		var eventRangesById = this.eventRangesById;

		(eventRangesById[eventDefId] || (eventRangesById[eventDefId] = []))
			.push(eventRange);

		this.tryRelease();
	},


	// Event Def/Instance/Range REMOVING
	// -----------------------------------------------------------------------------------------------------------------


	removeEventsById: function(eventDefId) {
		delete this.eventDefsById[eventDefId];
		delete this.eventInstancesById[eventDefId];

		if (eventDefId in this.eventRangesById) {
			delete this.eventRangesById[eventDefId];

			this.tryRelease();
		}
	},


	removeEventsBySource: function(source, isSilent) {
		var eventDefsById = this.eventDefsById;
		var eventInstancesById = this.eventInstancesById;
		var eventRangesById = this.eventRangesById;
		var id;
		var removeCnt = 0;

		function matchEventDef(eventDef) {
			return eventDef.source === source;
		}

		function matchEventInstance(eventInstance) {
			return eventInstance.def.source === source;
		}

		function matchEventRange(eventRange) {
			return eventRange.eventInstance.def.source === source;
		}

		for (id in eventDefsById) {
			removeMatching(eventDefsById[id], matchEventDef);
		}

		for (id in eventInstancesById) {
			removeMatching(eventInstancesById[id], matchEventInstance);
		}

		for (id in eventRangesById) {
			removeCnt += removeMatching(eventRangesById[id], matchEventRange);
		}

		if (removeCnt && !isSilent) {
			this.tryRelease();
		}
	},


	removeAllEvents: function(isSilent) {
		var hasAny = !$.isEmptyObject(this.eventRangesById);

		this.eventDefsById = {};
		this.eventInstancesById = {};
		this.eventRangesById = {};

		if (hasAny && !isSilent) {
			this.tryRelease();
		}
	},


	// Event Def/Instance/Range GETTING
	// -----------------------------------------------------------------------------------------------------------------


	getEventDefsById: function(eventDefId) {
		return this.eventDefsById[eventDefId] || [];
	},


	iterEventDefs: function(func) {
		var eventDefsById = this.eventDefId;
		var id;
		var eventDefs;
		var i;

		for (id in eventDefsById) {
			eventDefs = eventDefsById[id];

			for (i = 0; i < eventDefs.length; i++) {
				func(eventDefs[i]);
			}
		}
	},


	getEventInstances: function() { // TODO: consider iterator
		var eventInstancesById = this.eventInstancesById;
		var allInstances = [];
		var id;

		for (id in eventInstancesById) {
			allInstances.push.apply(allInstances, // append
				eventInstancesById[id]
			);
		}

		return allInstances;
	},


	getEventRanges: function() { // TODO: consider iterator
		var eventRangesById = this.eventRangesById;
		var matchingRanges = [];
		var id;

		for (id in eventRangesById) {
			matchingRanges.push.apply(matchingRanges, // append
				eventRangesById[id]
			);
		}

		return matchingRanges;
	},


	getEventRangesWithId: function(eventDefId) {
		return this.eventRangesById[eventDefId] || [];
	},


	getEventRangesWithoutId: function(eventDefId) { // TODO: consider iterator
		var eventRangesById = this.eventRangesById;
		var matchingRanges = [];
		var id;

		for (id in eventRangesById) {
			if (id !== eventDefId) {
				matchingRanges.push.apply(matchingRanges, // append
					eventRangesById[id]
				);
			}
		}

		return matchingRanges;
	},


	// Releasing and Freezing
	// -----------------------------------------------------------------------------------------------------------------


	tryRelease: function() {
		if (!this.pendingCnt) {
			if (!this.freezeDepth) {
				this.release();
			}
			else {
				this.stuntedReleaseCnt++;
			}
		}
	},


	release: function() {
		this.releaseCnt++;
		// TODO: dont re-convert to rangegroups
		this.trigger('release', hashToEventRangeGroups(this.eventRangesById));
	},


	whenReleased: function() {
		var _this = this;

		if (this.releaseCnt) {
			// TODO: dont re-convert to rangegroups
			return Promise.resolve(hashToEventRangeGroups(this.eventRangesById));
		}
		else {
			return Promise.construct(function(onResolve) {
				_this.one('release', onResolve);
			});
		}
	},


	freeze: function() {
		if (!(this.freezeDepth++)) {
			this.stuntedReleaseCnt = 0;
		}
	},


	thaw: function() {
		if (!(--this.freezeDepth) && this.stuntedReleaseCnt && !this.pendingCnt) {
			this.release();
		}
	}

});


function hashToEventRangeGroups(hash) {
	var eventRangeGroups = [];
	var id;

	for (id in hash) {
		eventRangeGroups.push(new EventRangeGroup(hash[id]));
	}

	return eventRangeGroups;
}
