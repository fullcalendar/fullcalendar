
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
		var undoDateMutation;

		if (this.dateMutation) {
			undoDateMutation = this.dateMutation.mutateSingle(eventDef);
		}

		// can't undo
		if (this.standardProps) {
			eventDef.applyStandardProps(this.standardProps);
		}

		// can't undo
		if (this.miscProps) {
			eventDef.miscProps = this.miscProps;
		}

		if (undoDateMutation) {
			return undoDateMutation;
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
	var calendar = eventDef.source.calendar;
	var standardProps = {};
	var miscProps = {};
	var propName;
	var newDateProfile;
	var dateMutation;
	var defMutation;

	for (propName in newRawProps) {
		if (propName !== 'start' && propName !== 'end') {
			if (eventDef.isStandardProp(propName)) {
				standardProps[propName] = newRawProps[propName];
			}
			else {
				miscProps[propName] = newRawProps[propName];
			}
		}
	}

	// the 'start' and 'end' props will be leveraged
	newDateProfile = EventDateProfile.parse(newRawProps, calendar);
	dateMutation = EventDefDateMutation.createFromDiff(
		eventInstance.dateProfile,
		newDateProfile,
		largeUnit
	);

	defMutation = new EventDefMutation();
	defMutation.standardProps = standardProps;
	defMutation.miscProps = miscProps;
	defMutation.dateMutation = dateMutation;

	return defMutation;
};
