
var BUSINESS_HOUR_EVENT_DEFAULTS = {
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


// Return events objects for business hours within the current view.
// Abuse of our event system :(
Calendar.prototype.buildCurrentBusinessRanges = function(wholeDay) {
	var eventPeriod = this.eventManager.currentPeriod;

	if (eventPeriod) {
		return new EventInstanceGroup(
			this.buildBusinessInstances(
				wholeDay,
				this.opt('businessHours'),
				eventPeriod.start,
				eventPeriod.end
			)
		).buildRanges();
	}
	else {
		return [];
	}
};


// Given a raw input value from options, return events objects for business hours within the current view.
Calendar.prototype.buildBusinessInstances = function(wholeDay, input, rangeStart, rangeEnd) {
	if (input === true) {
		return this._buildBusinessInstances(wholeDay, [ {} ], false, rangeStart, rangeEnd);
	}
	else if ($.isPlainObject(input)) {
		return this._buildBusinessInstances(wholeDay, [ input ], false, rangeStart, rangeEnd);
	}
	else if ($.isArray(input)) {
		return this._buildBusinessInstances(wholeDay, input, true, rangeStart, rangeEnd);
	}
	else {
		return [];
	}
};


Calendar.prototype._buildBusinessInstances = function(wholeDay, rawDefs, ignoreNoDow, rangeStart, rangeEnd) {
	var i;
	var rawDef;
	var fullRawDef;
	var eventDef;
	var eventInstances = [];

	for (i = 0; i < rawDefs.length; i++) {
		rawDef = rawDefs[i];

		if (ignoreNoDow && !rawDef.dow) {
			continue;
		}

		fullRawDef = $.extend({}, BUSINESS_HOUR_EVENT_DEFAULTS, rawDefs[i]);

		if (wholeDay) {
			fullRawDef.start = null;
			fullRawDef.end = null;
		}

		eventDef = RecurringEventDef.parse(
			fullRawDef,
			new EventSource(this), // dummy source
			this // calendar
		);

		eventInstances.push.apply(eventInstances, // append
			eventDef.buildInstances(rangeStart, rangeEnd)
		);
	}

	return eventInstances;
};
