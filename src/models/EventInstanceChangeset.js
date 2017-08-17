
var EventInstanceChangeset = Class.extend({

	isClear: false,
	byDefId: null,
	removalsByDefId: null,
	instanceCnt: 0,
	removalCnt: 0,


	constructor: function(isClear, removals, adds) {
		this.isClear = isClear || false;
		this.removalsByDefId = {};
		this.byDefId = {};

		(removals || []).forEach(this.removeEventInstance.bind(this));
		(adds || []).forEach(this.addEventInstance.bind(this));
	},


	isEmpty: function() {
		return !this.isClear && !this.removalCnt && !this.instanceCnt;
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
		this._addEventInstances(eventInstance.def.id, [ eventInstance ]);
	},


	removeEventInstance: function(eventInstance) {
		this._removeEventInstances(eventInstance.def.id, [ eventInstance ]);
	},


	_addEventInstances: function(id, eventInstances) {
		var bucket = (this.byDefId[id] || (this.byDefId[id] = []));

		bucket.push.apply(bucket, eventInstances);

		this.instanceCnt += eventInstances.length;
	},


	_removeEventInstances: function(id, eventInstances) {
		var bucket = this.byDefId[id];
		var i;

		for (i = 0; i < eventInstances.length; i++) {
			if (bucket && removeExact(bucket, eventInstances[i])) {

				if (!bucket.length) {
					delete this.byDefId[id];
				}

				this.instanceCnt--;
			}
			else {

				(this.removalsByDefId[id] || (this.removalsByDefId[id] = []))
					.push(eventInstances[i]);

				this.removalCnt++;
			}
		}
	},


	// returns true/false if resulted in changes
	addChangeset: function(changeset) {
		var theirRemoveHash = changeset.removalsByDefId;
		var theirAddHash = changeset.byDefId;
		var anyChanges = false;
		var id;

		if (changeset.isClear) {
			this.addClear();
			anyChanges = true;
		}

		for (id in theirRemoveHash) {
			this._removeEventInstances(id, theirRemoveHash[id]);
			anyChanges = true;
		}

		for (id in theirAddHash) {
			this._addEventInstances(id, theirAddHash[id]);
			anyChanges = true;
		}

		return anyChanges;
	},


	addClear: function() {
		this.isClear = true;
		this.removalsByDefId = {};
		this.byDefId = {};
		this.removalCnt = 0;
		this.instanceCnt = 0;
	}

});
