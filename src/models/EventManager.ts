
var EventManager = Class.extend(EmitterMixin, ListenerMixin, {

	currentPeriod: null,

	calendar: null,
	stickySource: null,
	otherSources: null, // does not include sticky source


	constructor: function(calendar) {
		this.calendar = calendar;
		this.stickySource = new ArrayEventSource(calendar);
		this.otherSources = [];
	},


	requestEvents: function(start, end, timezone, force) {
		if (
			force ||
			!this.currentPeriod ||
			!this.currentPeriod.isWithinRange(start, end) ||
			timezone !== this.currentPeriod.timezone
		) {
			this.setPeriod( // will change this.currentPeriod
				new EventPeriod(start, end, timezone)
			);
		}

		return this.currentPeriod.whenReleased();
	},


	// Source Adding/Removing
	// -----------------------------------------------------------------------------------------------------------------


	addSource: function(eventSource) {
		this.otherSources.push(eventSource);

		if (this.currentPeriod) {
			this.currentPeriod.requestSource(eventSource); // might release
		}
	},


	removeSource: function(doomedSource) {
		removeExact(this.otherSources, doomedSource);

		if (this.currentPeriod) {
			this.currentPeriod.purgeSource(doomedSource); // might release
		}
	},


	removeAllSources: function() {
		this.otherSources = [];

		if (this.currentPeriod) {
			this.currentPeriod.purgeAllSources(); // might release
		}
	},


	// Source Refetching
	// -----------------------------------------------------------------------------------------------------------------


	refetchSource: function(eventSource) {
		var currentPeriod = this.currentPeriod;

		if (currentPeriod) {
			currentPeriod.freeze();
			currentPeriod.purgeSource(eventSource);
			currentPeriod.requestSource(eventSource);
			currentPeriod.thaw();
		}
	},


	refetchAllSources: function() {
		var currentPeriod = this.currentPeriod;

		if (currentPeriod) {
			currentPeriod.freeze();
			currentPeriod.purgeAllSources();
			currentPeriod.requestSources(this.getSources());
			currentPeriod.thaw();
		}
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


	// Event-Period
	// -----------------------------------------------------------------------------------------------------------------


	setPeriod: function(eventPeriod) {
		if (this.currentPeriod) {
			this.unbindPeriod(this.currentPeriod);
			this.currentPeriod = null;
		}

		this.currentPeriod = eventPeriod;
		this.bindPeriod(eventPeriod);

		eventPeriod.requestSources(this.getSources());
	},


	bindPeriod: function(eventPeriod) {
		this.listenTo(eventPeriod, 'release', function(eventsPayload) {
			this.trigger('release', eventsPayload);
		});
	},


	unbindPeriod: function(eventPeriod) {
		this.stopListeningTo(eventPeriod);
	},


	// Event Getting/Adding/Removing
	// -----------------------------------------------------------------------------------------------------------------


	getEventDefByUid: function(uid) {
		if (this.currentPeriod) {
			return this.currentPeriod.getEventDefByUid(uid);
		}
	},


	addEventDef: function(eventDef, isSticky) {
		if (isSticky) {
			this.stickySource.addEventDef(eventDef);
		}

		if (this.currentPeriod) {
			this.currentPeriod.addEventDef(eventDef); // might release
		}
	},


	removeEventDefsById: function(eventId) {
		this.getSources().forEach(function(eventSource) {
			eventSource.removeEventDefsById(eventId);
		});

		if (this.currentPeriod) {
			this.currentPeriod.removeEventDefsById(eventId); // might release
		}
	},


	removeAllEventDefs: function() {
		this.getSources().forEach(function(eventSource) {
			eventSource.removeAllEventDefs();
		});

		if (this.currentPeriod) {
			this.currentPeriod.removeAllEventDefs();
		}
	},


	// Event Mutating
	// -----------------------------------------------------------------------------------------------------------------


	/*
	Returns an undo function.
	*/
	mutateEventsWithId: function(eventDefId, eventDefMutation) {
		var currentPeriod = this.currentPeriod;
		var eventDefs;
		var undoFuncs = [];

		if (currentPeriod) {

			currentPeriod.freeze();

			eventDefs = currentPeriod.getEventDefsById(eventDefId);
			eventDefs.forEach(function(eventDef) {
				// add/remove esp because id might change
				currentPeriod.removeEventDef(eventDef);
				undoFuncs.push(eventDefMutation.mutateSingle(eventDef));
				currentPeriod.addEventDef(eventDef);
			});

			currentPeriod.thaw();

			return function() {
				currentPeriod.freeze();

				for (var i = 0; i < eventDefs.length; i++) {
					currentPeriod.removeEventDef(eventDefs[i]);
					undoFuncs[i]();
					currentPeriod.addEventDef(eventDefs[i]);
				}

				currentPeriod.thaw();
			};
		}

		return function() { };
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
	},


	// Freezing
	// -----------------------------------------------------------------------------------------------------------------


	freeze: function() {
		if (this.currentPeriod) {
			this.currentPeriod.freeze();
		}
	},


	thaw: function() {
		if (this.currentPeriod) {
			this.currentPeriod.thaw();
		}
	}

});


// Methods that straight-up query the current EventPeriod for an array of results.
[
	'getEventDefsById',
	'getEventInstances',
	'getEventInstancesWithId',
	'getEventInstancesWithoutId'
].forEach(function(methodName) {

	EventManager.prototype[methodName] = function() {
		var currentPeriod = this.currentPeriod;

		if (currentPeriod) {
			return currentPeriod[methodName].apply(currentPeriod, arguments);
		}

		return [];
	};
});


function isSourcesEquivalent(source0, source1) {
	return source0.getPrimitive() == source1.getPrimitive();
}
