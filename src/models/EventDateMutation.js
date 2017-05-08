
var EventDateMutation = Class.extend({

	clearEnd: false,
	forceTimed: false,
	forceAllDay: false,
	startDelta: null,
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

		if (this.startDelta) {

			start.add(this.startDelta);

			if (end) {
				end.add(this.startDelta);
			}
		}

		if (this.durationDelta) {

			if (end) {
				end.add(this.durationDelta);
			}
		}

		if (isAmbigTimezone) {

			if (start.hasTime() && this.startDelta) {
				start.stripZone();
			}

			if (end && end.hasTime() && (this.startDelta || this.endDelta)) {
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


EventDateMutation.createFromDiff = function(profile1, profile2, largeUnit) {
	var clearEnd = profile1.end && !profile2.end;
	var forceTimed = profile1.isAllDay() && !profile2.isAllDay();
	var forceAllDay = !profile1.isAllDay() && profile2.isAllDay();
	var startDelta;
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

	startDelta = diffDates(profile2.start, profile1.start);

	if (profile2.end) {
		endDelta = diffDates(profile2.end, profile1.getEnd());
		durationDelta = endDelta.subtract(startDelta);
	}

	mutation = new EventDateMutation();
	mutation.clearEnd = clearEnd;
	mutation.forceTimed = forceTimed;
	mutation.forceAllDay = forceAllDay;
	mutation.startDelta = startDelta;
	mutation.endDelta = endDelta;

	return mutation;
}
