
var EventInstanceDataSourceSplitter = Class.extend(EmitterMixin, ListenerMixin, {

	keysFunc: null,


	constructor: function(keysFunc) {
		this.keysFunc = keysFunc;
	},


	buildSubSource: function(key) {
		var subDataSource = new EventInstanceDataSource();

		this.on('receive:' + key, function(changeset) {
			subDataSource.addChangeset(changeset);
		});

		this.on('after:receive', function() {
			if (!subDataSource.isPopulated) {
				subDataSource.addChangeset(new EventInstanceChangeset());
			}
		})

		return subDataSource;
	},


	addSource: function(dataSource) {
		this.listenTo(dataSource, 'receive', this.processChangeset);

		if (dataSource.isPopulated) {
			this.processChangeset(new EventInstanceChangeset(null, dataSource.instanceRepo));
		}
	},


	removeSource: function(dataSource) {
		this.stopListeningTo(dataSource);
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
			this.trigger('receive:' + key, changesetsByKey[key]);
		}

		this.trigger('after:receive');
	}

});
