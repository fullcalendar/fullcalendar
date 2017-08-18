
var EventInstanceChangeset = Class.extend({

	isClear: false,
	removalsRepo: null,
	additionsRepo: null,


	constructor: function(isClear, removalsRepo, additionsRepo) {
		this.isClear = isClear || false;
		this.removalsRepo = removalsRepo || new EventInstanceRepo();
		this.additionsRepo = additionsRepo || new EventInstanceRepo();
	},


	isEmpty: function() {
		return !this.isClear && !this.removalsRepo.cnt && !this.additionsRepo.cnt;
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
