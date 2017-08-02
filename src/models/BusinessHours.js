
var BUSINESS_HOUR_EVENT_DEFAULTS = {
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


var BusinessHours = Class.extend({

	rawComplexDef: null,
	unzonedRange: null,
	calendar: null, // for eventRangesToEventFootprints AND anonymous EventSource
	cache: null,


	constructor: function(rawComplexDef, unzonedRange, calendar) {
		this.rawComplexDef = rawComplexDef;
		this.unzonedRange = unzonedRange;
		this.calendar = calendar;
		this.cache = {};
	},


	getAllEventRanges: function(isAllDay) {
		var key = 'getAllEventRanges' + (isAllDay ? 1 : 0);
		var instanceGroup;

		if (!this.cache[key]) {
			instanceGroup = this.buildInstanceGroup(isAllDay);
			this.cache[key] = instanceGroup ? instanceGroup.getAllEventRanges() : [];
		}

		return this.cache[key];
	},


	sliceRenderRanges: function(isAllDay) {
		var key = 'sliceRenderRanges' + (isAllDay ? 1 : 0);
		var instanceGroup;

		if (!this.cache[key]) {
			instanceGroup = this.buildInstanceGroup(isAllDay);
			this.cache[key] = instanceGroup ? instanceGroup.sliceRenderRanges(this.unzonedRange) : [];
		}

		return this.cache[key];
	},


	buildInstanceGroup: function(isAllDay) {
		var eventDefs = this.buildEventDefs(isAllDay);
		var eventInstanceGroup;

		if (eventDefs.length) {
			eventInstanceGroup = new EventInstanceGroup(
				eventDefsToEventInstances(eventDefs, this.unzonedRange)
			);

			// so that inverse-background rendering can happen even when no eventRanges in view
			eventInstanceGroup.explicitEventDef = eventDefs[0];

			return eventInstanceGroup;
		}
	},


	buildEventDefs: function(isAllDay) {
		var rawComplexDef = this.rawComplexDef;
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
					this.buildEventDef(isAllDay, rawDefs[i])
				);
			}
		}

		return defs;
	},


	buildEventDef: function(isAllDay, rawDef) {
		var fullRawDef = $.extend({}, BUSINESS_HOUR_EVENT_DEFAULTS, rawDef);

		if (isAllDay) {
			fullRawDef.start = null;
			fullRawDef.end = null;
		}

		return RecurringEventDef.parse(
			fullRawDef,
			new EventSource(this.calendar) // dummy source
		);
	}

});
