
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


SingleEventDefinition.parse = function(rawProps, source, calendar) {
	var def = EventDefinition.parse.apply(this, arguments); // a SingleEventDefinition
	var start = calendar.moment(rawProps.start || rawProps.date); // 'date' is an alias
	var end = rawProps.end ? calendar.moment(rawProps.end) : null;

	if (!start.isValid()) {
		return false;
	}

	if (end && !end.isValid()) {
		end = null;
	}

	var forcedAllDay = rawProps.allDay;
	if (forcedAllDay == null) {
		forcedAllDay = source.allDayDefault;
		if (forcedAllDay == null) {
			forcedAllDay = calendar.opt('allDayDefault');
		}
	}

	if (forcedAllDay === true) {
		start.stripTime();
		if (end) {
			end.stripTime();
		}
	}
	else if (forcedAllDay === false) {
		start.time(0);
		if (end) {
			end.time(0);
		}
	}

	var forceEventDuration = calendar.opt('forceEventDuration');
	if (!end && forceEventDuration) {
		end = calendar.getDefaultEventEnd(!start.hasTime(), start);
	}

	def.start = start;
	def.end = end;

	return def;
};
