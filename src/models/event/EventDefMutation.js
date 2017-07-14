
var EventDefMutation = FC.EventDefMutation = Class.extend({

	// won't ever be empty. will be null instead.
	// callers should use setDateMutation for setting.
	dateMutation: null,

	// hack to get updateEvent/createFromRawProps to work.
	// not undo-able and not considered in isEmpty.
	rawProps: null, // raw (pre-parse-like)


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
		if (this.rawProps) {
			eventDef.applyRawProps(this.rawProps);
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


EventDefMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit) {
	var eventDef = eventInstance.def;
	var applicableRawProps = {};
	var propName;
	var newDateProfile;
	var dateMutation;
	var defMutation;

	for (propName in newRawProps) {
		if (
			// ignore object-type custom properties and any date-related properties,
			// as well as any other internal property
			typeof newRawProps[propName] !== 'object' &&
			propName !== 'start' && propName !== 'end' && propName !== 'allDay' &&
			propName !== 'source' && propName !== '_id'
		) {
			applicableRawProps[propName] = newRawProps[propName];
		}
	}

	newDateProfile = EventDateProfile.parse(newRawProps, eventDef.source);

	if (newDateProfile) { // no failure?
		dateMutation = EventDefDateMutation.createFromDiff(
			eventInstance.dateProfile,
			newDateProfile,
			largeUnit
		);
	}

	defMutation = new EventDefMutation();
	defMutation.rawProps = applicableRawProps;

	if (dateMutation) {
		defMutation.dateMutation = dateMutation;
	}

	return defMutation;
};
