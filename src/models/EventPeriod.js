
var EventPeriod = Class.extend(EmitterMixin, {

	start: null,
	end: null,
	timezone: null,

	unzonedRange: null,

	requestsByUid: null,
	pendingSourceCnt: 0,

	freezeDepth: 0,
	changeCnt: 0,

	eventDefsByUid: null,
	eventDefsById: null,
	instanceRepo: null,


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
		this.instanceRepo = new EventInstanceChangeset();
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
		this.pendingSourceCnt += 1;

		source.fetch(this.start, this.end, this.timezone).then(function(eventDefs) {
			if (request.status !== 'cancelled') {
				request.status = 'completed';
				request.eventDefs = eventDefs;

				_this.addEventDefs(eventDefs);
				_this.reportSourceDone();
			}
		}, function() { // failure
			if (request.status !== 'cancelled') {
				request.status = 'failed';

				_this.reportSourceDone();
			}
		});
	},


	purgeSource: function(source) {
		var request = this.requestsByUid[source.uid];

		if (request) {
			delete this.requestsByUid[source.uid];

			if (request.status === 'pending') {
				request.status = 'cancelled';

				this.decrementPending();
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
		var bucket = this.eventDefsById[eventDefId];

		if (bucket) {
			return bucket.slice(); // clone
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
		var bucket = eventDefsById[eventDefId] || (eventDefsById[eventDefId] = []);
		var eventInstances = eventDef.buildInstances(this.unzonedRange);

		bucket.push(eventDef);

		this.eventDefsByUid[eventDef.uid] = eventDef;

		this.applyChangeset(
			new EventInstanceChangeset(null, eventInstances)
		);
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
		this.instanceRepo.clear();

		if (!isEmpty) {
			this.clear();
		}
	},


	removeEventDef: function(eventDef) {
		var eventDefsById = this.eventDefsById;
		var bucket = eventDefsById[eventDef.id];

		delete this.eventDefsByUid[eventDef.uid];

		if (bucket) {
			removeExact(bucket, eventDef);

			if (!bucket.length) {
				delete eventDefsById[eventDef.id];
			}

			this.applyChangeset(new EventInstanceChangeset(
				this.instanceRepo.getEventInstancesForDef(eventDef) // removal
			));
		}
	},


	// Releasing and Freezing
	// -----------------------------------------------------------------------------------------------------------------


	clear: function() {
		this.pendingSourceCnt = 0;
		this.freezeDepth = 0;
		this.trigger('clear');
	},


	freeze: function() {
		this.freezeDepth++;
	},


	thaw: function() {
		var queuedChangeset = this.queuedChangeset;

		// protect against lower than zero in case clear() was called before thawing
		this.freezeDepth = Math.max(this.freezeDepth - 1, 0);

		if (queuedChangeset && !this.pendingSourceCnt && !this.freezeDepth) {
			this.queuedChangeset = null;
			this.changeCnt++;
			this.trigger('change', queuedChangeset);
		}
	},


	applyChangeset: function(changeset) {
		this.instanceRepo.applyChangeset(changeset);

		if (!this.pendingSourceCnt && !this.freezeDepth) {
			this.changeCnt++;
			this.trigger('change', changeset);
		}
		else if (!this.queuedChangeset) {
			this.queuedChangeset = changeset;
		}
		else {
			this.queuedChangeset.applyChangeset(changeset);
		}
	},


	reportSourceDone: function() {
		var queuedChangeset = this.queuedChangeset;

		this.pendingSourceCnt--;

		if (queuedChangeset && !this.pendingSourceCnt && !this.freezeDepth) {
			this.queuedChangeset = null;
			this.changeCnt++;
			this.trigger('change', queuedChangeset);
		}
	},


	whenReceived: function() {
		var _this = this;

		if (this.changeCnt) {
			return Promise.resolve(this.instanceRepo); // instanceRep IS a changeset
		}
		else {
			return Promise.construct(function(onResolve) { // wait for first reported change
				_this.one('change', onResolve);
			});
		}
	}

});
