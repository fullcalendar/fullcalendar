
var EventPeriod = Class.extend(EmitterMixin, {

	start: null,
	end: null,
	timezone: null,

	requests: null,
	pendingCnt: 0,

	freezeDepth: 0,
	stuntedReleaseCnt: 0,
	releaseCnt: 0,

	eventDefsByUid: null,
	eventDefsById: null,
	eventInstancesById: null,
	eventRangeGroupsById: null,


	constructor: function(start, end, timezone) {
		this.start = start;
		this.end = end;
		this.timezone = timezone;
		this.requests = [];
		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.eventInstancesById = {};
		this.eventRangeGroupsById = {};
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


	purgeSource: function(source) {
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
			this.removeEventDefsBySource(source); // might release
		}

		return removeCnt;
	},


	purgeAllSources: function() {
		if (this.requests.length) {
			this.requests.forEach(function(request) {
				request.status = 'cancelled';
			});

			this.requests = [];
			this.pendingCnt = 0;
			this.removeAllEventDefs(); // might release
		}
	},


	// Event Definitions
	// -----------------------------------------------------------------------------------------------------------------


	getEventDefByUid: function(eventDefUid) {
		return this.eventDefsByUid[eventDefUid];
	},


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


	addEventDefs: function(eventDefs) {
		for (var i = 0; i < eventDefs.length; i++) {
			this.addEventDef(eventDefs[i]);
		}
	},


	addEventDef: function(eventDef) {
		var eventDefsById = this.eventDefsById;
		var eventDefId = eventDef.id;
		var eventDefs = eventDefsById[eventDefId] || (eventDefsById[eventDefId] = []);
		var eventInstances = eventDef.buildInstances(this.start, this.end);
		var i;

		eventDefs.push(eventDef);

		this.eventDefsByUid[eventDef.uid] = eventDef;

		for (i = 0; i < eventInstances.length; i++) {
			this.addEventInstance(eventInstances[i], eventDefId);
		}
	},


	removeEventDefsById: function(eventDefId) {
		var _this = this;

		this.getEventDefsById(eventDefId).forEach(function(eventDef) {
			_this.removeEventDef(eventDef);
		});
	},


	removeEventDefsBySource: function(source) {
		var _this = this;

		this.iterEventDefs(function(eventDef) {
			if (eventDef.source === source) {
				_this.removeEventDef(eventDef);
			}
		});
	},


	removeAllEventDefs: function() {
		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.eventInstancesById = {};
		this.eventRangeGroupsById = {};
		this.tryRelease();
	},


	removeEventDef: function(eventDef) {
		var eventDefsById = this.eventDefsById;
		var eventDefs = eventDefsById[eventDef.id];

		delete this.eventDefsByUid[eventDef.uid];

		if (eventDefs) {
			removeExact(eventDefs, eventDef);

			if (!eventDefs.length) {
				delete eventDefsById[eventDef.id];
			}

			this.removeEventInstancesForDef(eventDef);
		}
	},


	// Event Instances
	// -----------------------------------------------------------------------------------------------------------------


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


	addEventInstance: function(eventInstance, eventDefId) {
		var eventInstancesById = this.eventInstancesById;
		var eventInstances = eventInstancesById[eventDefId] ||
			(eventInstancesById[eventDefId] = []);

		eventInstances.push(eventInstance);

		this.addEventRange(eventInstance.buildEventRange(), eventDefId);
	},


	removeEventInstancesForDef: function(eventDef) {
		var eventInstancesById = this.eventInstancesById;
		var eventInstances = eventInstancesById[eventDef.id];

		if (eventInstances) {
			removeMatching(eventInstances, function(currentEventInstance) {
				return currentEventInstance.def === eventDef;
			});

			if (!eventInstances.length) {
				delete eventInstancesById[eventDef.id];
			}

			this.removeEventRangesForDef(eventDef);
		}
	},


	// Event Ranges
	// -----------------------------------------------------------------------------------------------------------------


	getEventRanges: function() { // TODO: consider iterator
		var eventRangeGroupsById = this.eventRangeGroupsById;
		var allRanges = [];
		var id;

		for (id in eventRangeGroupsById) {
			allRanges.push.apply(allRanges, // append
				eventRangeGroupsById[id].eventRanges
			);
		}

		return allRanges;
	},


	getEventRangesWithId: function(eventDefId) {
		var eventRangeGroup = this.eventRangeGroupsById[eventDefId];

		if (eventRangeGroup) {
			return eventRangeGroup.eventRanges;
		}

		return [];
	},


	getEventRangesWithoutId: function(eventDefId) { // TODO: consider iterator
		var eventRangeGroupsById = this.eventRangeGroupsById;
		var matchingRanges = [];
		var id;

		for (id in eventRangeGroupsById) {
			if (id !== eventDefId) {
				matchingRanges.push.apply(matchingRanges, // append
					eventRangeGroupsById[id].eventRanges
				);
			}
		}

		return matchingRanges;
	},


	addEventRange: function(eventRange, eventDefId) {
		var eventRangeGroupsById = this.eventRangeGroupsById;
		var eventRangeGroup = eventRangeGroupsById[eventDefId] ||
			(eventRangeGroupsById[eventDefId] = new EventRangeGroup());

		eventRangeGroup.eventRanges.push(eventRange);

		this.tryRelease();
	},


	removeEventRangesForDef: function(eventDef) {
		var eventRangeGroupsById = this.eventRangeGroupsById;
		var eventRangeGroup = eventRangeGroupsById[eventDef.id];
		var removeCnt;

		if (eventRangeGroup) {
			removeCnt = removeMatching(eventRangeGroup.eventRanges, function(currentEventRange) {
				return currentEventRange.eventInstance.def === eventDef;
			});

			if (!eventRangeGroup.eventRanges.length) {
				delete eventRangeGroupsById[eventDef.id];
			}

			if (removeCnt) {
				this.tryRelease();
			}
		}
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
		this.trigger('release', this.eventRangeGroupsById);
	},


	whenReleased: function() {
		var _this = this;

		if (this.releaseCnt) {
			// TODO: dont re-convert to rangegroups
			return Promise.resolve(this.eventRangeGroupsById);
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
