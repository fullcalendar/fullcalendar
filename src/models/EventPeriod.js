
var EventPeriod = Class.extend(EmitterMixin, {

	start: null,
	end: null,
	timezone: null,

	unzonedRange: null,

	requestsByUid: null,
	pendingCnt: 0,

	freezeDepth: 0,
	stuntedReleaseCnt: 0,
	releaseCnt: 0,

	eventDefsByUid: null,
	eventDefsById: null,
	eventInstanceGroupsById: null,


	constructor: function(start, end, timezone) {
		this.start = start;
		this.end = end;
		this.timezone = timezone;

		this.unzonedRange = new UnzonedRange(
			start.clone().stripZone(),
			end.clone().stripZone()
		);

		this.requestsByUid = {};
		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.eventInstanceGroupsById = {};
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
		}, function() { // failure
			if (request.status !== 'cancelled') {
				request.status = 'failed';

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
		var eventInstances = eventDef.buildInstances(this.unzonedRange);
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
		this.eventInstanceGroupsById = {};

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
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var eventInstances = [];
		var id;

		for (id in eventInstanceGroupsById) {
			eventInstances.push.apply(eventInstances, // append
				eventInstanceGroupsById[id].eventInstances
			);
		}

		return eventInstances;
	},


	getEventInstancesWithId: function(eventDefId) {
		var eventInstanceGroup = this.eventInstanceGroupsById[eventDefId];

		if (eventInstanceGroup) {
			return eventInstanceGroup.eventInstances.slice(); // clone
		}

		return [];
	},


	getEventInstancesWithoutId: function(eventDefId) { // TODO: consider iterator
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var matchingInstances = [];
		var id;

		for (id in eventInstanceGroupsById) {
			if (id !== eventDefId) {
				matchingInstances.push.apply(matchingInstances, // append
					eventInstanceGroupsById[id].eventInstances
				);
			}
		}

		return matchingInstances;
	},


	addEventInstance: function(eventInstance, eventDefId) {
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var eventInstanceGroup = eventInstanceGroupsById[eventDefId] ||
			(eventInstanceGroupsById[eventDefId] = new EventInstanceGroup());

		eventInstanceGroup.eventInstances.push(eventInstance);

		this.tryRelease();
	},


	removeEventInstancesForDef: function(eventDef) {
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var eventInstanceGroup = eventInstanceGroupsById[eventDef.id];
		var removeCnt;

		if (eventInstanceGroup) {
			removeCnt = removeMatching(eventInstanceGroup.eventInstances, function(currentEventInstance) {
				return currentEventInstance.def === eventDef;
			});

			if (!eventInstanceGroup.eventInstances.length) {
				delete eventInstanceGroupsById[eventDef.id];
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
		this.trigger('release', this.eventInstanceGroupsById);
	},


	whenReleased: function() {
		var _this = this;

		if (this.releaseCnt) {
			return Promise.resolve(this.eventInstanceGroupsById);
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
