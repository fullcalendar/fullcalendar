
var EventPeriod = EventInstanceDataSource.extend({

	start: null,
	end: null,
	timezone: null,
	unzonedRange: null,
	requestsByUid: null,
	pendingSourceCnt: 0,
	eventDefsByUid: null,
	eventDefsById: null,


	constructor: function(start, end, timezone) {
		EventInstanceDataSource.call(this);

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
	},


	isWithinRange: function(start, end) {
		// TODO: use a range util function?
		return !start.isBefore(this.start) && !end.isAfter(this.end);
	},


	// Sources
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


	// generates and stores instances as well
	addEventDef: function(eventDef) {
		this.storeEventDef(eventDef);

		this.addChangeset(
			new EventInstanceChangeset(
				false, // isClear
				null, // removals
				new EventInstanceRepo( // additions
					eventDef.buildInstances(this.unzonedRange)
				)
			)
		);
	},


	// does NOT add any instances
	storeEventDef: function(eventDef) {
		var eventDefsById = this.eventDefsById;
		var id = eventDef.id;

		(eventDefsById[id] || (eventDefsById[id] = []))
			.push(eventDef);

		this.eventDefsByUid[eventDef.uid] = eventDef;
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

		this.addChangeset(
			new EventInstanceChangeset(true) // isClear=true
		);
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

			this.addChangeset(
				new EventInstanceChangeset(
					false, // isClear
					new EventInstanceRepo( // removals
						this.instanceRepo.getEventInstancesForDef(eventDef)
					)
				)
			);
		}
	},


	/*
	Returns an undo function.
	*/
	mutateEventsWithId: function(eventDefId, eventDefMutation) {
		var _this = this;
		var eventDefs;
		var undoFuncs = [];

		this.freeze();

		eventDefs = this.getEventDefsById(eventDefId);
		eventDefs.forEach(function(eventDef) {
			// add/remove esp because id might change
			_this.removeEventDef(eventDef);
			undoFuncs.push(eventDefMutation.mutateSingle(eventDef));
			_this.addEventDef(eventDef);
		});

		this.thaw();

		return function() {
			_this.freeze();

			for (var i = 0; i < eventDefs.length; i++) {
				_this.removeEventDef(eventDefs[i]);
				undoFuncs[i]();
				_this.addEventDef(eventDefs[i]);
			}

			_this.thaw();
		};
	},


	// Reporting and Triggering
	// -----------------------------------------------------------------------------------------------------------------


	reportSourceDone: function() {
		this.pendingSourceCnt--;
		this.trySendOutbound();
	},


	canTrigger: function() {
		return EventInstanceDataSource.prototype.canTrigger.apply(this, arguments) &&
			!this.pendingSourceCnt;
	}

});
