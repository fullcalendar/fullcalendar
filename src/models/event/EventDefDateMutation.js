
var EventDefDateMutation = Class.extend({

	clearEnd: false,
	forceTimed: false,
	forceAllDay: false,
	dateDelta: null,
	startDelta: null,
	endDelta: null,


	/*
	eventDef assumed to be a SingleEventDef.
	returns an undo function.
	*/
	mutateSingle: function(eventDef) {

		var calendar = eventDef.source.calendar;
		var origStart = eventDef.start;
		var origEnd = eventDef.end;
		var start = origStart.clone();
		var end = null;

		if (!this.clearEnd && origEnd) {
			end = origEnd.clone();
		}

		if (this.forceTimed) {

			if (!start.hasTime()) {
				start.time(0);
			}

			if (end && !end.hasTime()) {
				end.time(0);
			}
		}
		else if (this.forceAllDay) {

			if (start.hasTime()) {
				start.stripTime();
			}

			if (end && end.hasTime()) {
				end.stripTime();
			}
		}

		if (this.dateDelta) {

			start.add(this.dateDelta);

			if (end) {
				end.add(this.dateDelta);
			}
		}

		// do this before adding startDelta to start, so we can work off of start
		if (this.endDelta) {

			if (!end) {
				end = calendar.getDefaultEventEnd(eventDef.isAllDay(), start);
			}

			end.add(this.endDelta);
		}

		if (this.startDelta) {
			start.add(this.startDelta);
		}

		// clear timezone if any changes
		if (calendar.getIsAmbigTimezone()) {

			if (start.hasTime() && (this.dateDelta || this.startDelta)) {
				start.stripZone();
			}

			if (end && end.hasTime() && (this.dateDelta || this.endDelta)) {
				end.stripZone();
			}
		}

		eventDef.start = start;
		eventDef.end = end;

		return function() {
			eventDef.start = origStart;
			eventDef.end = origEnd;
		};
	},


	isEmpty: function() {
		return !this.clearEnd &&
			!this.forceTimed &&
			!this.forceAllDay &&
			(!this.dateDelta || !this.dateDelta.valueOf()) &&
			(!this.startDelta || !this.startDelta.valueOf()) &&
			(!this.endDelta || !this.endDelta.valueOf());
	}

});


EventDefDateMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit) {
	var newDateProfile = EventDateProfile.parse(
		newRawProps,
		eventInstance.def.source.calendar
	);

	return EventDefDateMutation.createFromDiff(
		eventInstance.dateProfile,
		newDateProfile,
		largeUnit
	);
};


EventDefDateMutation.createFromDiff = function(dateProfile0, dateProfile2, largeUnit) {
	var clearEnd = dateProfile0.end && !dateProfile2.end;
	var forceTimed = dateProfile0.isAllDay() && !dateProfile2.isAllDay();
	var forceAllDay = !dateProfile0.isAllDay() && dateProfile2.isAllDay();
	var dateDelta;
	var endDiff;
	var endDelta;
	var mutation;

	// subtracts the dates in the appropriate way, returning a duration
	function subtractDates(date1, date0) { // date1 - date0
		if (largeUnit) {
			return diffByUnit(date1, date0, largeUnit); // poorly named
		}
		else if (dateProfile2.isAllDay()) {
			return diffDay(date1, date0); // poorly named
		}
		else {
			return diffDayTime(date1, date0); // poorly named
		}
	}

	dateDelta = subtractDates(dateProfile2.start, dateProfile0.start);

	if (dateProfile2.end) {
		endDiff = subtractDates(dateProfile2.end, dateProfile0.getEnd());
		endDelta = endDiff.subtract(dateDelta);
	}

	mutation = new EventDefDateMutation();
	mutation.clearEnd = clearEnd;
	mutation.forceTimed = forceTimed;
	mutation.forceAllDay = forceAllDay;
	mutation.dateDelta = dateDelta;
	mutation.endDelta = endDelta;

	return mutation;
};
