
var EventInstanceRepo = Class.extend({

	byDefId: null,
	cnt: 0,


	constructor: function(eventInstances) {
		this.byDefId = {};

		(eventInstances || []).forEach(this.addEventInstance.bind(this));
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
		this._addEventInstance(eventInstance.def.id, eventInstance);
	},


	removeEventInstance: function(eventInstance) {
		return this._removeEventInstance(eventInstance.def.id, eventInstance);
	},


	_addEventInstance: function(id, eventInstance) {
		(this.byDefId[id] || (this.byDefId[id] = []))
			.push(eventInstance);

		this.cnt++;
	},


	_removeEventInstance: function(id, eventInstance) {
		var bucket = this.byDefId[id];

		if (bucket && removeExact(bucket, eventInstance)) {

			if (!bucket.length) {
				delete this.byDefId[id];
			}

			this.cnt--;

			return true;
		}

		return false;
	}

});
