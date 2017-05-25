
var BUSINESS_HOUR_EVENT_DEFAULTS = {
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


Calendar.prototype.buildCurrentBusinessRangeGroup = function(wholeDay) {
	var eventPeriod = this.eventManager.currentPeriod;

	return this.buildBusinessRangeGroup(
		wholeDay,
		this.opt('businessHours'),
		eventPeriod.start,
		eventPeriod.end
	);
};


Calendar.prototype.buildBusinessRangeGroup = function(wholeDay, rawComplexDef, rangeStart, rangeEnd) {
	var eventDefs = this.buildBusinessDefs(wholeDay, rawComplexDef);
	var eventInstances = eventDefsToEventInstances(eventDefs, rangeStart, rangeEnd);
	var eventRanges = eventInstancesToEventRanges(eventInstances);
	var eventRangeGroup = new EventRangeGroup(eventRanges);

	// so that inverse-background rendering can happen even when no eventRanges in view
	eventRangeGroup.explicitEventDef = eventDefs[0];

	return eventRangeGroup;
};


Calendar.prototype.buildBusinessDefs = function(wholeDay, rawComplexDef) {
	var rawDefs = [];
	var requireDow = false;
	var i;
	var defs = [];

	if (rawComplexDef === true) {
		rawDefs = [ {} ]; // will get BUSINESS_HOUR_EVENT_DEFAULTS verbatim
	}
	else if ($.isPlainObject(rawComplexDef)) {
		rawDefs = [ rawComplexDef ];
	}
	else if ($.isArray(rawComplexDef)) {
		rawDefs = rawComplexDef;
		requireDow = true; // every sub-definition NEEDS a day-of-week
	}

	for (i = 0; i < rawDefs.length; i++) {
		if (!requireDow || rawDefs[i].dow) {
			defs.push(
				this.buildBusinessDef(wholeDay, rawDefs[i])
			);
		}
	}

	return defs;
};


Calendar.prototype.buildBusinessDef = function(wholeDay, rawDef) {
	var fullRawDef = $.extend({}, BUSINESS_HOUR_EVENT_DEFAULTS, rawDef);

	if (wholeDay) {
		fullRawDef.start = null;
		fullRawDef.end = null;
	}

	return RecurringEventDef.parse(
		fullRawDef,
		new EventSource(this) // dummy source
	);
};
