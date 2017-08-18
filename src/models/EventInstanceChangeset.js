
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
	},


	clear: function() {
		this.byDefId = {};
		this.cnt = 0;
	}


});


var EventInstanceChangeset = Class.extend({

	isClear: false,
	removalsRepo: null,
	additionsRepo: null,


	constructor: function(isClear, removalsRepo, additionsRepo) {
		this.isClear = isClear || false;
		this.removalsRepo = removalsRepo || new EventInstanceRepo();
		this.additionsRepo = additionsRepo || new EventInstanceRepo();
	},


	applyToRepo: function(repo) {
		var removalsHash = this.removalsRepo.byDefId;
		var additionsHash = this.additionsRepo.byDefId;
		var id, instances;
		var i;

		if (this.isClear) {
			repo.clear();
		}

		for (id in removalsHash) {
			instances = removalsHash[id];

			for (i = 0; i < instances.length; i++) {
				repo._removeEventInstance(id, instances[i]);
			}
		}

		for (id in additionsHash) {
			instances = additionsHash[id];

			for (i = 0; i < instances.length; i++) {
				repo._addEventInstance(id, instances[i]);
			}
		}
	},


	applyToChangeset: function(changeset) {
		var removalsHash = this.removalsRepo.byDefId;
		var additionsHash = this.additionsRepo.byDefId;
		var id, instances;
		var i;

		if (this.isClear) {
			changeset.isClear = true;
			changeset.removalsRepo.clear();
			changeset.additionsRepo.clear();
		}

		for (id in removalsHash) {
			instances = removalsHash[id];

			for (i = 0; i < instances.length; i++) {
				if (!changeset.additionsRepo._removeEventInstance(id, instances[i])) {
					changeset.removalsRepo._addEventInstance(id, instances[i]);
				}
			}
		}

		for (id in additionsHash) {
			instances = additionsHash[id];

			for (i = 0; i < instances.length; i++) {
				changeset.additionsRepo._addEventInstance(id, instances[i]);
			}
		}
	}

});
