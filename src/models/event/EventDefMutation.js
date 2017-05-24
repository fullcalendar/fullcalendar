
var EventDefMutation = Class.extend({

	newTitle: null,
	newRendering: null,
	newConstraint: null,
	newOverlap: null,
	newClassName: null, // array or null

	additionalMiscProps: null,
	dateMutation: null,


	/*
	eventDef assumed to be a SingleEventDef.
	returns an undo function.
	*/
	mutateSingle: function(eventDef) {
		var origTitle = eventDef.title;
		var origRendering = eventDef.rendering;
		var origConstraint = eventDef.constraint;
		var origOverlap = eventDef.overlap;
		var origClassName = eventDef.className;
		var origMiscProps = eventDef.miscProps;
		var undoDateMutation;

		if (this.newTitle != null) {
			eventDef.title = this.newTitle;
		}

		if (this.newRendering != null) {
			eventDef.rendering = this.newRendering;
		}

		if (this.newConstraint != null) {
			eventDef.constraint = this.newConstraint;
		}

		if (this.newOverlap != null) {
			eventDef.overlap = this.newOverlap;
		}

		if (this.newClassName != null) {
			eventDef.className = this.newClassName;
		}

		if (this.additionalMiscProps != null) {
			// create a new object, so that "orig" stays intact
			eventDef.miscProps = $.extend({}, eventDef.miscProps, this.additionalMiscProps);
		}

		if (this.dateMutation) {
			undoDateMutation = this.dateMutation.mutateSingle(eventDef);
		}

		return function() {
			eventDef.title = origTitle;
			eventDef.rendering = origRendering;
			eventDef.constraint = origConstraint;
			eventDef.overlap = origOverlap;
			eventDef.className = origClassName;
			eventDef.miscProps = origMiscProps;

			if (undoDateMutation) {
				undoDateMutation();
			}
		};
	},


	isEmpty: function() {
		return this.newTitle == null &&
			this.newRendering == null &&
			this.newConstraint == null &&
			this.newOverlap == null &&
			this.newClassName == null &&
			this.additionalMiscProps == null &&
			(!this.dateMutation || this.dateMutation.isEmpty());
	}

});


EventDefMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit) {
	var additionalMiscProps = {};
	var propName;
	var dateMutation;
	var defMutation;

	for (propName in newRawProps) {
		if (!eventInstance.def.isStandardProp(propName)) {
			additionalMiscProps[propName] = newRawProps[propName];
		}
	}

	dateMutation = EventDefDateMutation.createFromRawProps(eventInstance, newRawProps, largeUnit);

	defMutation = new EventDefMutation();
	defMutation.newTitle = newRawProps.title;
	defMutation.newRendering = newRawProps.rendering;
	defMutation.newConstraint = newRawProps.constraint;
	defMutation.newOverlap = newRawProps.overlap;
	defMutation.newClassName = newRawProps.className;
	defMutation.additionalMiscProps = additionalMiscProps;
	defMutation.dateMutation = dateMutation;

	return defMutation;
};
