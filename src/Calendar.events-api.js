
Calendar.mixin({

	// Sources
	// ------------------------------------------------------------------------------------


	getEventSources: function() {
		return this.eventManager.otherSources.slice(); // clone
	},


	getEventSourceById: function(id) {
		return this.eventManager.getSourceById(
			EventSource.normalizeId(id)
		);
	},


	addEventSource: function(sourceInput) {
		var source = EventSourceParser.parse(sourceInput, this);

		if (source) {
			this.eventManager.addSource(source);
		}
	},


	removeEventSources: function(sourceQuery) {
		if (sourceQuery == null) {
			this.eventManager.removeAllSources();
		}
		else {
			this.removeEventSource(sourceQuery);
		}
	},


	removeEventSource: function(sourceQuery) { // can do multiple
		var eventManager = this.eventManager;
		var sources = eventManager.querySources(sourceQuery);
		var i;

		eventManager.freeze();

		for (i = 0; i < sources.length; i++) {
			eventManager.removeSource(sources[i]);
		}

		eventManager.thaw();
	},


	refetchEventSources: function(sourceQuery) {
		var eventManager = this.eventManager;
		var sources = eventManager.querySources(sourceQuery);
		var i;

		eventManager.freeze();

		for (i = 0; i < sources.length; i++) {
			eventManager.refetchSource(sources[i]);
		}

		eventManager.unfreeze();
	},


	// Events
	// ------------------------------------------------------------------------------------


	refetchEvents: function() {
		this.eventManager.refetchAllSources();
	},


	// CHANGELOG: note how it does not return objects anymore
	renderEvents: function(eventInputs, isSticky) {
		this.eventManager.freeze();

		for (var i = 0; i < eventInputs.length; i++) {
			this.renderEvent(eventInputs[i], isSticky);
		}

		this.eventManager.unfreeze();
	},


	// CHANGELOG: note how it does not return objects anymore
	renderEvent: function(eventInput, isSticky) {
		var eventManager = this.eventManager;
		var eventDef = EventDefParser.parse(
			eventInput,
			eventInput.source || eventManager.stickySource
		);

		if (eventDef) {
			eventManager.addEventDef(eventDef, isSticky);
		}
	},


	// TODO: improve. can do shortcut if given straight IDs
	removeEvents: function(legacyQuery) {
		var eventManager = this.eventManager;
		var eventIds = this.queryEventIdsViaLegacy(legacyQuery);
		var i;

		eventManager.freeze();

		for (i = 0; i < eventIds.length; i++) {
			eventManager.removeEventDefsById(eventIds[i]);
		}

		eventManager.unfreeze();
	},


	// is a utility. not meant to be public
	queryEventIdsViaLegacy: function(legacyQuery) {
		var eventInstances = this.eventManager.getEventInstances();
		var matchFunc = buildEventInstanceMatcher(legacyQuery);
		var i;
		var eventIdMap = {}; // to remove

		for (i = 0; i < eventInstances.length; i++) {
			if (matchFunc(eventInstances[i])) {
				eventIdMap[
					eventInstances[i].def.id
				] = true;
			}
		}

		return Object.keys(eventIdMap);
	},


	clientEvents: function(legacyQuery) {
		var eventInstances = this.eventManager.getEventInstances();
		var matchFunc = buildEventInstanceMatcher(legacyQuery);
		var i;
		var legacyInstances = [];

		for (i = 0; i < eventInstances.length; i++) {
			if (matchFunc(eventInstances[i])) {
				legacyInstances.push(eventInstances[i].toLegacy()); // TODO: optimimze re-legacyifying
			}
		}

		return legacyInstances;
	},


	updateEvents: function(eventPropsArray) {
		this.eventManager.freeze();

		for (var i = 0; i < eventPropsArray.length; i++) {
			this.updateEvent(eventPropsArray[i]);
		}

		this.eventManager.unfreeze();
	},


	updateEvent: function(eventProps) {
		var eventDef = this.eventManager.getEventDefByUid(eventProps._id);
		var eventInstance;
		var eventDefMutation;

		if (eventDef instanceof SingleEventDef) {
			eventInstance = eventDef.buildInstances()[0];

			eventDefMutation = EventDefMutation.createFromRawProps(
				eventInstance,
				eventProps, // raw props
				null // largeUnit -- who uses it?
			);

			this.eventManager.mutateEventsWithId(eventDef.id, eventDefMutation); // will release
		}
	}

});


function buildEventInstanceMatcher(legacyQuery) {
	if (legacyQuery == null) {
		return function() {
			return true;
		};
	}
	else if ($.isFunction(legacyQuery)) {
		return function(eventInstance) {
			return legacyQuery(eventInstance.toLegacy());
		};
	}
	else if (legacyQuery) { // an event ID
		legacyQuery += ''; // normalize to string

		return function(eventInstance) {
			return eventInstance.def.id === legacyQuery;
		};
	}
	else {
		return function() {
			return false;
		};
	}
}
