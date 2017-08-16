
var EventInstanceChangeset = Class.extend({

	isClear: false,
	removals: null,
	byDefId: null,
	instanceCnt: 0,
	addChangesetCnt: 0, // TODO: eventually remove


	constructor: function(isClear, removals, adds) {
		this.isClear = isClear || false;
		this.removals = removals || [];
		this.byDefId = {};

		(adds || []).forEach(this.addEventInstance.bind(this));
	},


	hasAddsOrRemoves: function() {
		return this.instanceCnt || this.removals.length;
	},


	getEventInstancesForDef: function(eventDef) {
		return (this.byDefId[eventDef.id] || []).filter(function(eventInstance) {
			return eventInstance.def === eventDef;
		});
	},


	getEventInstances: function() {
		var byDefId = this.byDefId;
		var a = [];
		var id;

		for (id in byDefId) {
			a.push.apply(a, byDefId[id]);
		}

		return a;
	},


	iterEventInstances: function(func) {
		var byDefId = this.byDefId;
		var defId, instances;
		var i;

		for (defId in byDefId) {
			instances = byDefId[defId];

			for (i = 0; i < instances.length; i++) {
				func(instances[i]);
			}
		}
	},


	getEventInstancesWithId: function(eventDefId) {
		var bucket = this.byDefId[eventDefId];

		if (bucket) {
			return bucket.slice(); // clone
		}

		return [];
	},


	getEventInstancesWithoutId: function(eventDefId) {
		var byDefId = this.byDefId;
		var a = [];
		var id;

		for (id in byDefId) {
			if (id !== eventDefId) {
				a.push.apply(a, byDefId[id]);
			}
		}

		return a;
	},


	addEventInstance: function(eventInstance) {
		var id = eventInstance.def.id;

		(this.byDefId[id] || (this.byDefId[id] = []))
			.push(eventInstance);

		this.instanceCnt++;
	},


	// returns true/false if removed
	removeEventInstance: function(eventInstance) {
		var id = eventInstance.def.id;
		var bucket = this.byDefId[id];

		if (bucket && removeExact(bucket, eventInstance)) {

			if (!bucket.length) {
				delete this.byDefId[id];
			}

			this.instanceCnt--;

			return true;
		}

		return false;
	},


	// returns true/false if resulted in changes
	addChangeset: function(changeset) {
		var theirHash = changeset.byDefId;
		var theirRemovals = changeset.removals;
		var anyChanges = false;
		var i;
		var ourBucket;

		if (changeset.isClear) {
			this.addClear();
			anyChanges = true;
		}

		for (i = 0; i < theirRemovals.length; i++) {
			if (!this.removeEventInstance(theirRemovals[i])) { // not removed?
				this.removals.push(theirRemovals[i]); // then record as a future action
			}
			anyChanges = true;
		}

		for (i in theirHash) { // `i` is actually an EventDef id
			ourBucket = (this.byDefId[i] || (this.byDefId[i] = []));
			ourBucket.push.apply(ourBucket, theirHash[i]);

			this.instanceCnt += theirHash[i].length;
			anyChanges = true;
		}

		this.addChangesetCnt++;

		return anyChanges;
	},


	addClear: function() {
		this.isClear = true;
		this.removals = [];
		this.byDefId = {};
		this.instanceCnt = 0;
	}

});
