
var EventDateMutation = Class.extend({ // TODO: EventDefDateMutation

	clearEnd: false,
	forceTimed: false,
	forceAllDay: false,
	dateDelta: null,
	startDelta: null,
	endDelta: null,


	mutateSingleEventDefinition: function(eventDef, calendar) {
		var origStart = eventDef.start;
		var origEnd = eventDef.end;
		var start = origStart.clone();
		var end = origEnd ? origEnd.clone() : null;

		if (this.clearEnd) {
			end = null;
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

		// do this before adding startDelta to start,
		// so we can work off of start
		if (this.endDelta) {

			if (!end) {
				// eventDef better be a SingleEventDefinition!
				end = calendar.getDefaultEventEnd(eventDef.isAllDay(), start);
			}

			end.add(this.endDelta);
		}

		if (this.startDelta) {
			start.add(this.startDelta);
		}

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
	}

});


EventDateMutation.createFromRawProps = function(eventInstance, newRawProps, largeUnit, calendar) {
	var newEventDateProfile = new EventDateProfile(
		calendar.moment(newRawProps.start),
		newRawProps.end ? calendar.moment(newRawProps.end) : null
	);

	return EventDateMutation.createFromDiff(
		eventInstance.eventDateProfile,
		newEventDateProfile,
		largeUnit
	);
};


EventDateMutation.createFromDiff = function(profile1, profile2, largeUnit) {
	var clearEnd = profile1.end && !profile2.end;
	var forceTimed = profile1.isAllDay() && !profile2.isAllDay();
	var forceAllDay = !profile1.isAllDay() && profile2.isAllDay();
	var dateDelta;
	var endDiff;
	var endDelta;
	var mutation;

	// diffs the dates in the appropriate way, returning a duration
	function diffDates(date1, date0) { // date1 - date0
		if (largeUnit) {
			return diffByUnit(date1, date0, largeUnit);
		}
		else if (profile2.isAllDay()) {
			return diffDay(date1, date0);
		}
		else {
			return diffDayTime(date1, date0);
		}
	}

	dateDelta = diffDates(profile2.start, profile1.start);

	if (profile2.end) {
		endDiff = diffDates(profile2.end, profile1.getEnd());
		endDelta = endDiff.subtract(dateDelta);
	}

	mutation = new EventDateMutation();
	mutation.clearEnd = clearEnd;
	mutation.forceTimed = forceTimed;
	mutation.forceAllDay = forceAllDay;
	mutation.dateDelta = dateDelta;
	mutation.endDelta = endDelta;

	return mutation;
}
