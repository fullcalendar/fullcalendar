
var EventMutation = Class.extend({ // TODO: EventDefMutation

	newTitle: null,
	newRendering: null,
	additionalMiscProps: null,
	dateMutation: null,


	// will not provide an undo function
	mutateSingleEventDefinition: function(eventDef, isAmbigTimezone) {
		eventDef.title = this.newTitle;
		eventDef.rendering = this.newRendering;
		$.extend(eventDef.miscProps, this.additionalMiscProps || {});

		this.dateMutation.mutateSingleEventDefinition(
			eventDef,
			isAmbigTimezone
		);
	}

});


EventMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit, calendar) {
	var newTitle = newRawProps.title;
	var newRendering = newRawProps.rendering;
	var additionalMiscProps = {};
	var propName;
	var newEventDateProfile;
	var dateMutation;
	var eventMutation;

	for (propName in newRawProps) {
		if (!eventInstance.eventDefinition.isStandardProp(propName)) {
			additionalMiscProps[propName] = newRawProps[propName];
		}
	}

	newEventDateProfile = new EventDateProfile(
		calendar.moment(newRawProps.start),
		newRawProps.end ? calendar.moment(newRawProps.end) : null
	);

	dateMutation = EventDateMutation.createFromDiff(
		eventInstance.eventDateProfile,
		newEventDateProfile,
		largeUnit
	);

	eventMutation = new EventMutation();
	eventMutation.newTitle = newTitle;
	eventMutation.newRendering = newRendering;
	eventMutation.additionalMiscProps = additionalMiscProps;
	eventMutation.dateMutation = dateMutation;

	return eventMutation;
};

