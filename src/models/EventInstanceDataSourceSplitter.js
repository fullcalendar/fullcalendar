
var EventInstanceDataSourceSplitter = FC.EventInstanceDataSourceSplitter = Class.extend(EmitterMixin, ListenerMixin, {

	keysFunc: null,
	repoHash: null,


	constructor: function(keysFunc) {
		this.keysFunc = keysFunc;
		this.repoHash = {};
	},


	buildSubSource: function(key) {
		var subDataSource = new EventInstanceDataSource();
		var initialRepo = this.repoHash[key];

		if (initialRepo) {
			subDataSource.addChangeset(new EventInstanceChangeset(null, initialRepo));
		}

		subDataSource.listenTo(this, 'receive:' + key, function(changeset) {
			subDataSource.addChangeset(changeset);
		});

		return subDataSource;
	},


	releaseSubResource: function(subDataSource) {
		subDataSource.stopListeningTo(this);
	},


	addSource: function(dataSource) {

		if (dataSource.instanceRepo.cnt) {
			this.processChangeset(new EventInstanceChangeset(null, dataSource.instanceRepo)); // add all
		}

		this.listenTo(dataSource, 'receive', this.processChangeset);
	},


	removeSource: function(dataSource) {
		this.stopListeningTo(dataSource);

		if (dataSource.instanceRepo.cnt) {
			this.processChangeset(new EventInstanceChangeset(dataSource.instanceRepo)); // remove all
		}
	},


	processChangeset: function(changeset) {
		var keysFunc = this.keysFunc;
		var changesetsByKey = {};
		var key;
		var getChangeset = function(key) {
			return (changesetsByKey[key] || (changesetsByKey[key] = new EventInstanceChangeset()));
		};

		changeset.removalsRepo.iterEventInstances(function(eventInstance) {
			keysFunc(eventInstance).forEach(function(key) {
				getChangeset(key).removalsRepo.addEventInstance(eventInstance);
			});
		});

		changeset.additionsRepo.iterEventInstances(function(eventInstance) {
			keysFunc(eventInstance).forEach(function(key) {
				getChangeset(key).additionsRepo.addEventInstance(eventInstance);
			});
		});

		for (key in changesetsByKey) {
			changesetsByKey[key].applyToRepo(this.ensureRepo(key));

			this.trigger('receive:' + key, changesetsByKey[key]);
		}
	},


	ensureRepo: function(key) {
		return (this.repoHash[key] || (this.repoHash[key] = new EventInstanceRepo()));
	}

});
