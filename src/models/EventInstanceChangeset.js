
var EventInstanceChangeset = Class.extend({

	removalsRepo: null,
	additionsRepo: null,


	constructor: function(removalsRepo, additionsRepo) {
		this.removalsRepo = removalsRepo || new EventInstanceRepo();
		this.additionsRepo = additionsRepo || new EventInstanceRepo();
	},


	applyToRepo: function(repo) {
		var removalsHash = this.removalsRepo.byDefId;
		var additionsHash = this.additionsRepo.byDefId;
		var id, instances;
		var i;

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
