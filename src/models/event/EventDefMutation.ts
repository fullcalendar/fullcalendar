
var EventDefMutation = FC.EventDefMutation = Class.extend({

	// won't ever be empty. will be null instead.
	// callers should use setDateMutation for setting.
	dateMutation: null,

	// hacks to get updateEvent/createFromRawProps to work.
	// not undo-able and not considered in isEmpty.
	eventDefId: null, // standard manual props
	className: null, // "
	verbatimStandardProps: null,
	miscProps: null,


	/*
	eventDef assumed to be a SingleEventDef.
	returns an undo function.
	*/
	mutateSingle: function(eventDef) {
		var origDateProfile;

		if (this.dateMutation) {
			origDateProfile = eventDef.dateProfile;

			eventDef.dateProfile = this.dateMutation.buildNewDateProfile(
				origDateProfile,
				eventDef.source.calendar
			);
		}

		// can't undo
		// TODO: more DRY with EventDef::applyManualStandardProps
		if (this.eventDefId != null) {
			eventDef.id = EventDef.normalizeId((eventDef.rawId = this.eventDefId));
		}

		// can't undo
		// TODO: more DRY with EventDef::applyManualStandardProps
		if (this.className) {
			eventDef.className = this.className;
		}

		// can't undo
		if (this.verbatimStandardProps) {
			SingleEventDef.copyVerbatimStandardProps(
				this.verbatimStandardProps, // src
				eventDef // dest
			);
		}

		// can't undo
		if (this.miscProps) {
			eventDef.applyMiscProps(this.miscProps);
		}

		if (origDateProfile) {
			return function() {
				eventDef.dateProfile = origDateProfile;
			};
		}
		else {
			return function() { };
		}
	},


	setDateMutation: function(dateMutation) {
		if (dateMutation && !dateMutation.isEmpty()) {
			this.dateMutation = dateMutation;
		}
		else {
			this.dateMutation = null;
		}
	},


	isEmpty: function() {
		return !this.dateMutation;
	}

});


EventDefMutation.createFromRawProps = function(eventInstance, rawProps, largeUnit) {
	var eventDef = eventInstance.def;
	var dateProps = {};
	var standardProps = {};
	var miscProps = {};
	var verbatimStandardProps = {};
	var eventDefId = null;
	var className = null;
	var propName;
	var dateProfile;
	var dateMutation;
	var defMutation;

	for (propName in rawProps) {
		if (EventDateProfile.isStandardProp(propName)) {
			dateProps[propName] = rawProps[propName];
		}
		else if (eventDef.isStandardProp(propName)) {
			standardProps[propName] = rawProps[propName];
		}
		else if (eventDef.miscProps[propName] !== rawProps[propName]) { // only if changed
			miscProps[propName] = rawProps[propName];
		}
	}

	dateProfile = EventDateProfile.parse(dateProps, eventDef.source);

	if (dateProfile) { // no failure?
		dateMutation = EventDefDateMutation.createFromDiff(
			eventInstance.dateProfile,
			dateProfile,
			largeUnit
		);
	}

	if (standardProps.id !== eventDef.id) {
		eventDefId = standardProps.id; // only apply if there's a change
	}

	if (!isArraysEqual(standardProps.className, eventDef.className)) {
		className = standardProps.className; // only apply if there's a change
	}

	EventDef.copyVerbatimStandardProps(
		standardProps, // src
		verbatimStandardProps // dest
	);

	defMutation = new EventDefMutation();
	defMutation.eventDefId = eventDefId;
	defMutation.className = className;
	defMutation.verbatimStandardProps = verbatimStandardProps;
	defMutation.miscProps = miscProps;

	if (dateMutation) {
		defMutation.dateMutation = dateMutation;
	}

	return defMutation;
};
