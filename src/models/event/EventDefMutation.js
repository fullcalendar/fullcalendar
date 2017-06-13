
var EventDefMutation = Class.extend({

	dateMutation: null,

	// hacks to get updateEvent/createFromRawProps to work.
	// not undo-able and not considered in isEmpty.
	standardProps: null, // raw (pre-parse-like)
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
		if (this.standardProps) {
			eventDef.applyStandardProps(this.standardProps);
		}

		// can't undo
		if (this.miscProps) {
			eventDef.miscProps = this.miscProps;
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


	isEmpty: function() {
		return !this.dateMutation || this.dateMutation.isEmpty();
	}

});


EventDefMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit) {
	var eventDef = eventInstance.def;
	var standardProps = {};
	var miscProps = {};
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
			if (eventDef.isStandardProp(propName)) {
				standardProps[propName] = newRawProps[propName];
			}
			else {
				miscProps[propName] = newRawProps[propName];
			}
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
	defMutation.standardProps = standardProps;
	defMutation.miscProps = miscProps;

	if (dateMutation) {
		defMutation.dateMutation = dateMutation;
	}

	return defMutation;
};
