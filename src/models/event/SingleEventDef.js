
var SingleEventDef = EventDef.extend(EventStartEndMixin, {


	/*
	Will receive start/end params, but will be ignored.
	*/
	buildInstances: function() {
		return [
			new EventInstance(
				this, // definition
				new EventDateProfile(this.start, this.end)
			)
		];
	},


	clone: function() {
		var def = EventDef.prototype.clone.call(this);

		def.start = this.start.clone();

		if (this.end) {
			def.end = this.end.clone();
		}

		return def;
	},


	rezone: function() {
		var calendar = this.source.calendar;

		this.start = calendar.moment(this.start);

		if (this.end) {
			this.end = calendar.moment(this.end);
		}
	}

});


SingleEventDef.addReservedProps([ 'start', 'end', 'date' ]);


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


SingleEventDef.parse = function(rawProps, source) {
	var def = EventDef.parse.apply(this, arguments); // a SingleEventDef
	var calendar = source.calendar;
	var start = calendar.moment(rawProps.start || rawProps.date); // 'date' is an alias
	var end = rawProps.end ? calendar.moment(rawProps.end) : null;
	var forcedAllDay;
	var forceEventDuration;

	if (!start.isValid()) {
		return false;
	}

	if (end && !end.isValid()) {
		end = null;
	}

	forcedAllDay = rawProps.allDay;
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

	forceEventDuration = calendar.opt('forceEventDuration');
	if (!end && forceEventDuration) {
		end = calendar.getDefaultEventEnd(!start.hasTime(), start);
	}

	def.start = start;
	def.end = end;

	return def;
};
