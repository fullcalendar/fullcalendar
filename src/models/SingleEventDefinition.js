
var SingleEventDefinition = EventDefinition.extend({ // TODO: mix-in some of EventInstance's methods?

	start: null,
	end: null,


	buildInstances: function() { // disregards start/end
		return [
			new EventInstance(
				this, // definition
				new EventDateProfile(this.start, this.end)
			)
		];
	},


	clone: function() {
		var def = EventDefinition.prototype.clone.call(this);

		def.start = this.start.clone();

		if (this.end) {
			def.end = this.end.clone();
		}

		return def;
	},


	isAllDay: function() {
		// TODO: make more DRY
		return !(this.start.hasTime() || (this.end && this.end.hasTime()));
	}

});


SingleEventDefinition.addReservedProps([ 'start', 'end', 'date' ]);


SingleEventDefinition.parse = function(rawProps, calendar) {
	var def = EventDefinition.parse.call(this, rawProps); // a SingleEventDefinition

	def.start = calendar.moment(rawProps.start || rawProps.date); // 'date' is an alias
	def.end = rawProps.end ? calendar.moment(rawProps.end) : null;

	return def;
};
