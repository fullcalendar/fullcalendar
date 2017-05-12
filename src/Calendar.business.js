
var BUSINESS_HOUR_EVENT_DEFAULTS = {
	id: '_fcBusinessHours', // will relate events from different calls to expandEvent
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


// Return events objects for business hours within the current view.
// Abuse of our event system :(
Calendar.prototype.buildCurrentBusinessFootprints = function(wholeDay) {
	var activeRange = this.getView().activeRange;

	return this.eventInstanceGroupToFootprints(
		this.buildBusinessGroup(
			wholeDay,
			this.opt('businessHours'),
			activeRange.start,
			activeRange.end
		)
	);
};


// Given a raw input value from options, return events objects for business hours within the current view.
Calendar.prototype.buildBusinessGroup = function(wholeDay, input, rangeStart, rangeEnd) {
	if (input === true) {
		return this._buildBusinessGroup(wholeDay, [ {} ], false, rangeStart, rangeEnd);
	}
	else if ($.isPlainObject(input)) {
		return this._buildBusinessGroup(wholeDay, [ input ], false, rangeStart, rangeEnd);
	}
	else if ($.isArray(input)) {
		return this._buildBusinessGroup(wholeDay, input, true, rangeStart, rangeEnd);
	}
	else {
		return new EventInstanceGroup([]);
	}
};


Calendar.prototype._buildBusinessGroup = function(wholeDay, rawDefs, ignoreNoDow, rangeStart, rangeEnd) {
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

		eventDef = RecurringEventDefinition.parse(fullRawDef);

		eventInstances.push.apply(eventInstances, // append
			eventDef.buildInstances(rangeStart, rangeEnd)
		);
	}

	return new EventInstanceGroup(eventInstances);
};
