
var EventInstanceChangeset = Class.extend({

	removals: null,
	byDefId: null,


	constructor: function(removals, adds) {
		this.byDefId = {};

		this.removals = removals || [];

		(adds || []).forEach(this.addEventInstance.bind(this));
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
			bucket.slice(); // clone
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
	},


	removeEventInstance: function(eventInstance) {
		var id = eventInstance.def.id;
		var bucket = this.byDefId[id];

		if (bucket) {
			removeExact(bucket, eventInstance);
		}

		if (!bucket.length) {
			delete this.byDefId[id];
		}
	},


	clear: function() {
		this.byDefId = {};
	},


	applyChangeset: function(changeset) {
		var ourHash = this.byDefId;
		var theirHash = changeset.byDefId;
		var id;
		var ourBucket;

		changeset.removals.forEach(this.removeEventInstance.bind(this));

		for (id in theirHash) {
			ourBucket = (ourHash[id] || (ourHash[id] = []));
			ourBucket.push.apply(ourBucket, theirHash[id]);
		}
	}

});
