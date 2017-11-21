import * as $ from 'jquery'
import { eventDefsToEventInstances } from '../models/event/util'
import EventInstanceGroup from './event/EventInstanceGroup'
import RecurringEventDef from './event/RecurringEventDef'
import EventSource from './event-source/EventSource'


var BUSINESS_HOUR_EVENT_DEFAULTS = {
	start: '09:00',
	end: '17:00',
	dow: [ 1, 2, 3, 4, 5 ], // monday - friday
	rendering: 'inverse-background'
	// classNames are defined in businessHoursSegClasses
};


export default class BusinessHourGenerator {

	rawComplexDef: any
	calendar: any // for anonymous EventSource


	constructor(rawComplexDef, calendar) {
		this.rawComplexDef = rawComplexDef;
		this.calendar = calendar;
	}


	buildEventInstanceGroup(isAllDay, unzonedRange) {
		var eventDefs = this.buildEventDefs(isAllDay);
		var eventInstanceGroup;

		if (eventDefs.length) {
			eventInstanceGroup = new EventInstanceGroup(
				eventDefsToEventInstances(eventDefs, unzonedRange)
			);

			// so that inverse-background rendering can happen even when no eventRanges in view
			eventInstanceGroup.explicitEventDef = eventDefs[0];

			return eventInstanceGroup;
		}
	}


	buildEventDefs(isAllDay) {
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
	}


	buildEventDef(isAllDay, rawDef) {
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

}
