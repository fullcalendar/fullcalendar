
var EventPeriod = Class.extend(EmitterMixin, {

	start: null,
	end: null,
	timezone: null,

	unzonedRange: null,

	requestsByUid: null,
	pendingSourceCnt: 0,
	freezeDepth: 0,

	eventDefsByUid: null,
	eventDefsById: null,

	outboundChangeset: null,
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

				this.reportSourceDone();
			}
			else if (request.status === 'completed') {
				this.freeze();

				request.eventDefs.forEach(this.removeEventDef.bind(this));

				this.thaw();
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

		this.pendingSourceCnt = 0;
		this.requestsByUid = {};

		if (completedCnt) {
			this.removeAllEventDefs();
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
		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.applyClear();
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


	// Reporting and Triggering
	// -----------------------------------------------------------------------------------------------------------------


	applyChangeset: function(changeset) {
		this.instanceRepo.applyChangeset(changeset); // internally record immediately

		if (!this.outboundChangeset) {
			this.outboundChangeset = changeset;
		}
		else {
			this.outboundChangeset.applyChangeset(changeset);
		}

		this.trySendOutbound();
	},


	// assumes no pendingSourceCnt, so allowed to trigger immediately
	applyClear: function() {
		this.instanceRepo.clear();
		this.outboundChangeset = null;
		this.freezeDepth = 0; // thaw
		this.trigger('clear');
	},


	freeze: function() {
		this.freezeDepth++;
	},


	thaw: function() {
		// protect against lower than zero in case clear() was called before thawing
		this.freezeDepth = Math.max(this.freezeDepth - 1, 0);

		this.trySendOutbound();
	},


	reportSourceDone: function() {
		this.pendingSourceCnt--;

		this.trySendOutbound();
	},


	trySendOutbound: function() {
		var outboundChangeset = this.outboundChangeset;

		if (outboundChangeset && this.isFinalized()) {
			this.outboundChangeset = null;
			this.trigger('change', outboundChangeset);
		}
	},


	tryReset: function() {
		if (this.isFinalized()) {
			this.trigger('clear');
			this.trigger('change', this.instanceRepo);
		}
	},


	// returns undefined if none finalized
	getFinalized: function() {
		if (this.isFinalized()) {
			return this.instanceRepo;
		}
	},


	isFinalized: function() {
		return !this.pendingSourceCnt && !this.freezeDepth;
	}

});
