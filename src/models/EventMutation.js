
var EventMutation = Class.extend({ // TODO: EventDefMutation

	newTitle: null,
	newRendering: null,
	additionalMiscProps: null,
	dateMutation: null,


	// will not provide an undo function
	mutateSingleEventDefinition: function(eventDef, calendar) {
		var origTitle = eventDef.title;
		var origRendering = eventDef.rendering;
		var origMiscProps = eventDef.miscProps;
		var undoDateMutation;

		if (this.newTitle != null) {
			eventDef.title = this.newTitle;
		}

		if (this.newRendering != null) {
			eventDef.rendering = this.newRendering;
		}

		$.extend({}, eventDef.miscProps, this.additionalMiscProps || {});

		undoDateMutation = this.dateMutation.mutateSingleEventDefinition(
			eventDef,
			calendar
		);

		return function() {
			eventDef.title = origTitle;
			eventDef.rendering = origRendering;
			eventDef.miscProps = origMiscProps;

			undoDateMutation();
		};
	},


	isSomething: function() {
		return this.newTitle != null || this.newRendering != null || this.additionalMiscProps ||
			(this.dateMutation && this.dateMutation.isSomething());
	}

});


EventMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit, calendar) {
	var newTitle = newRawProps.title;
	var newRendering = newRawProps.rendering;
	var additionalMiscProps = {};
	var propName;
	var dateMutation;
	var eventMutation;

	for (propName in newRawProps) {
		if (!eventInstance.eventDefinition.isStandardProp(propName)) {
			additionalMiscProps[propName] = newRawProps[propName];
		}
	}

	dateMutation = EventDateMutation.createFromRawProps(
		eventInstance, newRawProps, largeUnit, calendar
	);

	eventMutation = new EventMutation();
	eventMutation.newTitle = newTitle;
	eventMutation.newRendering = newRendering;
	eventMutation.additionalMiscProps = additionalMiscProps;
	eventMutation.dateMutation = dateMutation;

	return eventMutation;
};

