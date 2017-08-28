
var EventManager = RequestableEventDataSource.extend({

	calendar: null,
	stickySource: null,
	otherSources: null, // does not include sticky source


	constructor: function(calendar) {
		RequestableEventDataSource.call(this);

		this.calendar = calendar;
		this.stickySource = new ArrayEventSource(calendar);
		this.otherSources = [];

		this.on('before:receive', function() {
			calendar.startBatchRender();
		});
		this.on('after:receive', function() {
			calendar.stopBatchRender();
		});
	},


	// Source Adding/Removing
	// -----------------------------------------------------------------------------------------------------------------


	addSource: function(eventSource) {
		this.otherSources.push(eventSource);

		if (this.currentUnzonedRange) {
			this.requestSource(eventSource);
		}
	},


	removeSource: function(doomedSource) {
		removeExact(this.otherSources, doomedSource);
		this.purgeSource(doomedSource);
	},


	removeAllSources: function() {
		this.otherSources = [];
		this.purgeAllSources();
	},


	// Source Querying
	// -----------------------------------------------------------------------------------------------------------------


	getSources: function() {
		return [ this.stickySource ].concat(this.otherSources);
	},


	// like querySources, but accepts multple match criteria (like multiple IDs)
	multiQuerySources: function(matchInputs) {

		// coerce into an array
		if (!matchInputs) {
			matchInputs = [];
		}
		else if (!$.isArray(matchInputs)) {
			matchInputs = [ matchInputs ];
		}

		var matchingSources = [];
		var i;

		// resolve raw inputs to real event source objects
		for (i = 0; i < matchInputs.length; i++) {
			matchingSources.push.apply( // append
				matchingSources,
				this.querySources(matchInputs[i])
			);
		}

		return matchingSources;
	},


	// matchInput can either by a real event source object, an ID, or the function/URL for the source.
	// returns an array of matching source objects.
	querySources: function(matchInput) {
		var sources = this.otherSources;
		var i, source;

		// given a proper event source object
		for (i = 0; i < sources.length; i++) {
			source = sources[i];

			if (source === matchInput) {
				return [ source ];
			}
		}

		// an ID match
		source = this.getSourceById(EventSource.normalizeId(matchInput));
		if (source) {
			return [ source ];
		}

		// parse as an event source
		matchInput = EventSourceParser.parse(matchInput, this.calendar);
		if (matchInput) {

			return $.grep(sources, function(source) {
				return isSourcesEquivalent(matchInput, source);
			});
		}
	},


	/*
	ID assumed to already be normalized
	*/
	getSourceById: function(id) {
		return $.grep(this.otherSources, function(source) {
			return source.id && source.id === id;
		})[0];
	},


	// Event Adding/Removing needs to have side-effects in the sources
	// -----------------------------------------------------------------------------------------------------------------


	addEventDef: function(eventDef, persist) {
		if (persist) {
			this.stickySource.addEventDef(eventDef);
		}

		RequestableEventDataSource.prototype.addEventDef.apply(this, arguments);
	},


	removeEventDefsById: function(eventId, persist) {
		if (persist) {
			this.getSources().forEach(function(eventSource) {
				eventSource.removeEventDefsById(eventId);
			});
		}

		RequestableEventDataSource.prototype.removeEventDefsById.apply(this, arguments);
	},


	removeAllEventDefs: function(persist) {
		if (persist) {
			this.getSources().forEach(function(eventSource) {
				eventSource.removeAllEventDefs();
			});
		}

		RequestableEventDataSource.prototype.removeAllEventDefs.apply(this, arguments);
	},


	// Event Mutating
	// -----------------------------------------------------------------------------------------------------------------


	/*
	Returns an undo function.
	*/
	mutateEventsWithId: function(eventDefId, eventDefMutation) {
		var calendar = this.calendar;
		var undoFunc;

		// emits two separate changesets, so make sure rendering happens only once
		calendar.startBatchRender();
		undoFunc = RequestableEventDataSource.prototype.mutateEventsWithId.apply(this, arguments);
		calendar.stopBatchRender();

		return function() {
			calendar.startBatchRender();
			undoFunc();
			calendar.stopBatchRender();
		};
	},


	/*
	copies and then mutates
	*/
	buildMutatedEventInstanceGroup: function(eventDefId, eventDefMutation) {
		var eventDefs = this.getEventDefsById(eventDefId);
		var i;
		var defCopy;
		var allInstances = [];

		for (i = 0; i < eventDefs.length; i++) {
			defCopy = eventDefs[i].clone();

			if (defCopy instanceof SingleEventDef) {
				eventDefMutation.mutateSingle(defCopy);

				allInstances.push.apply(allInstances, // append
					defCopy.buildInstances()
				);
			}
		}

		return new EventInstanceGroup(allInstances);
	}

});


function isSourcesEquivalent(source0, source1) {
	return source0.getPrimitive() == source1.getPrimitive();
}
