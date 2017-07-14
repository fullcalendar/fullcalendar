
var BUSINESS_HOUR_EVENT_DEFAULTS = {
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


/*
returns ComponentFootprint[]
`businessHourDef` is optional. Use Calendar's setting if omitted.
*/
Calendar.prototype.buildCurrentBusinessFootprints = function(wholeDay) {
	return this._buildCurrentBusinessFootprints(wholeDay, this.opt('businessHours'));
};


Calendar.prototype._buildCurrentBusinessFootprints = function(wholeDay, businessDefInput) {
	var eventPeriod = this.eventManager.currentPeriod;
	var businessInstanceGroup;

	if (eventPeriod) {
		businessInstanceGroup = this.buildBusinessInstanceGroup(
			wholeDay,
			businessDefInput,
			eventPeriod.unzonedRange
		);

		if (businessInstanceGroup) {
			return this.eventInstancesToFootprints( // in Calendar.constraints.js
				businessInstanceGroup.eventInstances
			);
		}
	}

	return [];
};


/*
If there are business hours, and they are within range, returns populated EventInstanceGroup.
If there are business hours, but they aren't within range, returns a zero-item EventInstanceGroup.
If there are NOT business hours, returns undefined.
*/
Calendar.prototype.buildBusinessInstanceGroup = function(wholeDay, rawComplexDef, unzonedRange) {
	var eventDefs = this.buildBusinessDefs(wholeDay, rawComplexDef);
	var eventInstanceGroup;

	if (eventDefs.length) {
		eventInstanceGroup = new EventInstanceGroup(
			eventDefsToEventInstances(eventDefs, unzonedRange)
		);

		// so that inverse-background rendering can happen even when no eventRanges in view
		eventInstanceGroup.explicitEventDef = eventDefs[0];

		return eventInstanceGroup;
	}
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
