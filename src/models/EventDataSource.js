
/*
Stores EventDefs AND EventInstances
*/
var EventDataSource = EventInstanceDataSource.extend({

	currentUnzonedRange: null, // for creating EventInstances

	eventDefsByUid: null,
	eventDefsById: null,


	constructor: function() {
		EventInstanceDataSource.call(this);

		this.eventDefsByUid = {};
		this.eventDefsById = {};
	},


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
				null, // removals
				new EventInstanceRepo( // additions
					eventDef.buildInstances(this.currentUnzonedRange)
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
		this.freeze();

		Object.values(this.eventDefsByUid).forEach(
			this.removeEventDef.bind(this)
		);

		this.thaw();
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
					new EventInstanceRepo( // removals
						this.instanceRepo.getEventInstancesForDef(eventDef)
					)
				)
			);
		}
	},


	/*
	Will emit TWO SEPARATE CHANGESETS. This is due to EventDef's being mutable.
	Returns an undo function.
	*/
	mutateEventsWithId: function(eventDefId, eventDefMutation) {
		var _this = this;
		var eventDefs = this.getEventDefsById(eventDefId);
		var undoFuncs;

		eventDefs.forEach(this.removeEventDef.bind(this));

		undoFuncs = eventDefs.map(function(eventDef) {
			return eventDefMutation.mutateSingle(eventDef);
		});

		eventDefs.forEach(this.addEventDef.bind(this));

		return function() {
			eventDefs.forEach(_this.removeEventDef.bind(_this));

			undoFuncs.forEach(function(undoFunc) {
				undoFunc();
			});

			eventDefs.forEach(_this.addEventDef.bind(_this));
		};
	}

});
