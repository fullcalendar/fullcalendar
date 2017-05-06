
var SingleEventDefinition = EventDefinition.extend({

	start: null,
	end: null,

	constructor: function(rawProps, source, calendar) {
		EventDefinition.apply(this, arguments);

		this.start = calendar.moment(rawProps.start || rawProps.date); // 'date' is an alias
		this.end = rawProps.end ? calendar.moment(rawProps.end) : null;
	},

	isStandardProp: function(name) {
		return EventDefinition.prototype.isStandardProp(name) ||
			name === 'start' || name === 'end' || name === 'date'; // 'date' is an alias
	},

	buildInstances: function() { // disregards start/end
		return [
			new EventInstance(
				this, // definition
				new EventDateProfile(this.start, this.end)
			)
		];
	}

});
