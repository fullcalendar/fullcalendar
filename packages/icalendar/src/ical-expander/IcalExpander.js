/* eslint-disable */
/*
from https://github.com/mifi/ical-expander
released under https://github.com/mifi/ical-expander/blob/master/LICENSE
operates entirely in UTC
*/

import * as ICAL from 'ical.js'

export class IcalExpander {
  constructor(opts) {
    this.maxIterations = opts.maxIterations != null ? opts.maxIterations : 1000;
    this.skipInvalidDates = opts.skipInvalidDates != null ? opts.skipInvalidDates : false;

    this.jCalData = ICAL.parse(opts.ics);
    this.component = new ICAL.Component(this.jCalData);
    this.events = this.component.getAllSubcomponents('vevent').map(vevent => new ICAL.Event(vevent));

    if (this.skipInvalidDates) {
      this.events = this.events.filter((evt) => {
        try {
          evt.startDate.toJSDate();
          evt.endDate.toJSDate();
          return true;
        } catch (err) {
          // skipping events with invalid time
          return false;
        }
      });
    }
  }

  between(after, before) {
    function isEventWithinRange(startTime, endTime) {
      return (!after || endTime >= after.getTime()) &&
      (!before || startTime <= before.getTime());
    }

    function getTimes(eventOrOccurrence) {
      const startTime = eventOrOccurrence.startDate.toJSDate().getTime();
      let endTime = eventOrOccurrence.endDate.toJSDate().getTime();

      // If it is an all day event, the end date is set to 00:00 of the next day
      // So we need to make it be 23:59:59 to compare correctly with the given range
      if (eventOrOccurrence.endDate.isDate && (endTime > startTime)) {
        endTime -= 1;
      }

      return { startTime, endTime };
    }

    const exceptions = [];

    this.events.forEach((event) => {
      if (event.isRecurrenceException()) exceptions.push(event);
    });

    const ret = {
      events: [],
      occurrences: [],
    };

    this.events.filter(e => !e.isRecurrenceException()).forEach((event) => {
      const exdates = [];

      event.component.getAllProperties('exdate').forEach((exdateProp) => {
        const exdate = exdateProp.getFirstValue();
        exdates.push(exdate.toJSDate().getTime());
      });

      // Recurring event is handled differently
      if (event.isRecurring()) {
        const iterator = event.iterator();

        let next;
        let i = 0;

        do {
          i += 1;
          next = iterator.next();
          if (next) {
            const occurrence = event.getOccurrenceDetails(next);

            const { startTime, endTime } = getTimes(occurrence);

            const isOccurrenceExcluded = exdates.indexOf(startTime) !== -1;

            // TODO check that within same day?
            const exception = exceptions.find(ex => ex.uid === event.uid && ex.recurrenceId.toJSDate().getTime() === occurrence.startDate.toJSDate().getTime());

            // We have passed the max date, stop
            if (before && startTime > before.getTime()) break;

            // Check that we are within our range
            if (isEventWithinRange(startTime, endTime)) {
              if (exception) {
                ret.events.push(exception);
              } else if (!isOccurrenceExcluded) {
                ret.occurrences.push(occurrence);
              }
            }
          }
        }
        while (next && (!this.maxIterations || i < this.maxIterations));

        return;
      }

      // Non-recurring event:
      const { startTime, endTime } = getTimes(event);

      if (isEventWithinRange(startTime, endTime)) ret.events.push(event);
    });

    return ret;
  }

  before(before) {
    return this.between(undefined, before);
  }

  after(after) {
    return this.between(after);
  }

  all() {
    return this.between();
  }
}
