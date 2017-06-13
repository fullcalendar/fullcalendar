
var SingleEventDef = EventDef.extend({

	dateProfile: null,


	/*
	Will receive start/end params, but will be ignored.
	*/
	buildInstances: function() {
		return [
			new EventInstance(
				this, // definition
				this.dateProfile
			)
		];
	},


	isAllDay: function() {
		return this.dateProfile.isAllDay();
	},


	clone: function() {
		var def = EventDef.prototype.clone.call(this);

		def.dateProfile = this.dateProfile;

		return def;
	},


	rezone: function() {
		var calendar = this.source.calendar;
		var dateProfile = this.dateProfile;

		this.dateProfile = new EventDateProfile(
			calendar.moment(dateProfile.start),
			dateProfile.end ? calendar.moment(dateProfile.end) : null,
			calendar
		);
	}

});


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


SingleEventDef.defineStandardPropHandler([
	'start',
	'date', // alias for 'start'
	'end',
	'allDay'
], function(rawProps) {
	var dateProfile = EventDateProfile.parse(rawProps, this.source);

	if (dateProfile) { // no failure?
		this.dateProfile = dateProfile;
	}
	else {
		return false;
	}
});
