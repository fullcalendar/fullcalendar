
var EventDateMutation = Class.extend({ // TODO: EventDefDateMutation

	clearEnd: false,
	forceTimed: false,
	forceAllDay: false,
	dateDelta: null,
	durationDelta: null,


	mutateSingleEventDefinition: function(eventDef, isAmbigTimezone) {
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

		if (this.durationDelta) {

			if (end) {
				end.add(this.durationDelta);
			}
		}

		if (isAmbigTimezone) {

			if (start.hasTime() && this.dateDelta) {
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
	var endDelta;
	var durationDelta;
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
		endDelta = diffDates(profile2.end, profile1.getEnd());
		durationDelta = endDelta.subtract(dateDelta);
	}

	mutation = new EventDateMutation();
	mutation.clearEnd = clearEnd;
	mutation.forceTimed = forceTimed;
	mutation.forceAllDay = forceAllDay;
	mutation.dateDelta = dateDelta;
	mutation.endDelta = endDelta;

	return mutation;
}
