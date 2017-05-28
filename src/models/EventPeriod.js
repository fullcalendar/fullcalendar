
var EventPeriod = Class.extend(EmitterMixin, {

	start: null,
	end: null,
	timezone: null,

	requestsByUid: null,
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
		this.requestsByUid = {};
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

		this.requestsByUid[source.uid] = request;
		this.pendingCnt += 1;

		source.fetch(this.start, this.end, this.timezone).then(function(eventDefs) {
			if (request.status !== 'cancelled') {
				request.status = 'completed';
				request.eventDefs = eventDefs;

				_this.addEventDefs(eventDefs);
				_this.pendingCnt--;
				_this.tryRelease();
			}
		});
	},


	purgeSource: function(source) {
		var request = this.requestsByUid[source.uid];

		if (request) {
			delete this.requestsByUid[source.uid];

			if (request.status === 'pending') {
				request.status = 'cancelled';
				this.pendingCnt--;
				this.tryRelease();
			}
			else if (request.status === 'completed') {
				request.eventDefs.forEach(this.removeEventDef.bind(this));
			}
		}
	},


	purgeAllSources: function() {
		var requestsByUid = this.requestsByUid;
		var uid, request;
		var completedCnt = 0;

		for (uid in requestsByUid) {
			request = requestsByUid[uid];

			if (request.status === 'pending') {
				request.status = 'cancelled';
			}
			else if (request.status === 'completed') {
				completedCnt++;
			}
		}

		this.requestsByUid = {};
		this.pendingCnt = 0;

		if (completedCnt) {
			this.removeAllEventDefs(); // might release
		}
	},


	// Event Definitions
	// -----------------------------------------------------------------------------------------------------------------


	getEventDefByUid: function(eventDefUid) {
		return this.eventDefsByUid[eventDefUid];
	},


	getEventDefsById: function(eventDefId) {
		var a = this.eventDefsById[eventDefId];

		if (a) {
			return a.slice(); // clone
		}

		return [];
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


	removeAllEventDefs: function() {
		var isEmpty = $.isEmptyObject(this.eventDefsByUid);

		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.eventInstancesById = {};
		this.eventRangeGroupsById = {};

		if (!isEmpty) {
			this.tryRelease();
		}
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


	getEventInstancesById: function(eventDefId) {
		var eventInstances = this.eventInstancesById[eventDefId];

		if (eventInstances) {
			return eventInstances.slice(); // clone
		}

		return [];
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
			return eventRangeGroup.eventRanges.slice(); // clone
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
		this.trigger('release', this.eventRangeGroupsById);
	},


	whenReleased: function() {
		var _this = this;

		if (this.releaseCnt) {
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
