import UnzonedRange from '../UnzonedRange'

/*
Meant to be immutable
*/
export default class EventDateProfile {

	start: any
	end: any
	unzonedRange: any


	constructor(start, end, calendar) {
		this.start = start;
		this.end = end || null;
		this.unzonedRange = this.buildUnzonedRange(calendar);
	}


	isAllDay() { // why recompute this every time?
		return !(this.start.hasTime() || (this.end && this.end.hasTime()));
	}


	/*
	Needs a Calendar object
	*/
	buildUnzonedRange(calendar) {
		var startMs = this.start.clone().stripZone().valueOf();
		var endMs = this.getEnd(calendar).stripZone().valueOf();

		return new UnzonedRange(startMs, endMs);
	}


	/*
	Needs a Calendar object
	*/
	getEnd(calendar) {
		return this.end ?
			this.end.clone() :
			// derive the end from the start and allDay. compute allDay if necessary
			calendar.getDefaultEventEnd(
				this.isAllDay(),
				this.start
			);
	}


	static isStandardProp(propName) {
		return propName === 'start' || propName === 'date' || propName === 'end' || propName === 'allDay';
	}


	/*
	Needs an EventSource object
	*/
	static parse(rawProps, source) {
		var startInput = rawProps.start || rawProps.date;
		var endInput = rawProps.end;

		if (!startInput) {
			return false;
		}

		var calendar = source.calendar;
		var start = calendar.moment(startInput);
		var end = endInput ? calendar.moment(endInput) : null;
		var forcedAllDay = rawProps.allDay;
		var forceEventDuration = calendar.opt('forceEventDuration');

		if (!start.isValid()) {
			return false;
		}

		if (end && (!end.isValid() || !end.isAfter(start))) {
			end = null;
		}

		if (forcedAllDay == null) {
			forcedAllDay = source.allDayDefault;
			if (forcedAllDay == null) {
				forcedAllDay = calendar.opt('allDayDefault');
			}
		}

		if (forcedAllDay === true) {
			start.stripTime();
			if (end) {
				end.stripTime();
			}
		}
		else if (forcedAllDay === false) {
			if (!start.hasTime()) {
				start.time(0);
			}
			if (end && !end.hasTime()) {
				end.time(0);
			}
		}

		if (!end && forceEventDuration) {
			end = calendar.getDefaultEventEnd(!start.hasTime(), start);
		}

		return new EventDateProfile(start, end, calendar);
	}

}
