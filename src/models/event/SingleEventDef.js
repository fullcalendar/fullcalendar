
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


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


SingleEventDef.defineStandardPropHandler([
	'start',
	'date', // alias for 'start'
	'end',
	'allDay'
], function(rawProps) {
	var startInput = rawProps.start || rawProps.date;
	var endInput = rawProps.end;

	if (!startInput) {
		return false;
	}

	var source = this.source;
	var calendar = source.calendar;
	var start = calendar.moment(startInput);
	var end = endInput ? calendar.moment(endInput) : null;
	var forcedAllDay = rawProps.allDay;
	var forceEventDuration = calendar.opt('forceEventDuration');

	if (!start.isValid()) {
		return false;
	}

	if (end && (!end.isValid() || !end.isAfter(start))) {
		end = null;
	}

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
		if (!start.hasTime()) {
			start.time(0);
		}
		if (end && !end.hasTime()) {
			end.time(0);
		}
	}

	if (!end && forceEventDuration) {
		end = calendar.getDefaultEventEnd(!start.hasTime(), start);
	}

	this.start = start;
	this.end = end;
});
