
var BUSINESS_HOUR_EVENT_DEFAULTS = {
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


var BusinessHourGenerator = FC.BusinessHourGenerator = Class.extend({

	rawComplexDef: null,
	calendar: null, // for anonymous EventSource


	constructor: function(rawComplexDef, calendar) {
		this.rawComplexDef = rawComplexDef;
		this.calendar = calendar;
	},


	buildEventInstanceGroup: function(isAllDay, unzonedRange) {
		var eventDefs = this.buildEventDefs(isAllDay);
		var eventInstanceGroup;
		var eventInstances;
		var buildInstancesFunc = $.proxy(this.buildSingleEventInstances, this, isAllDay, unzonedRange);

		if (eventDefs.length) {
			eventInstances = eventDefsToEventInstances(eventDefs, unzonedRange);

			if (this.calendar.hasPublicHandlers('businessHourEventFilter')) {
				eventInstances = this.calendar.publiclyTrigger('businessHourEventFilter', {
					context: this,
					args: [ eventInstances, buildInstancesFunc ]
				});
			}

			eventInstanceGroup = new EventInstanceGroup(eventInstances);

			// so that inverse-background rendering can happen even when no eventRanges in view
			eventInstanceGroup.explicitEventDef = eventDefs[0];

			return eventInstanceGroup;
		}
	},


	buildSingleEventInstances: function(isAllDay, unzonedRange, rawDef) {
		var eventDef = this.buildEventDef(isAllDay, $.extend(rawDef, { dow: null }));
		var dayStart = this.calendar.moment(rawDef.date).stripTime();
		var dayEnd = dayStart.clone().add(1, 'day');
		var dateRange = unzonedRange.intersect(new UnzonedRange(dayStart, dayEnd));

		if (dateRange === null) {
			return [];
		}
		return eventDef.buildInstances(dateRange);
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
