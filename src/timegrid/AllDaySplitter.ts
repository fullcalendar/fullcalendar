import {
  Splitter,
  hasBgRendering,
  EventDef,
  DateSpan
} from '@fullcalendar/core'

export default class AllDaySplitter extends Splitter {

  getKeyInfo() {
    return {
      allDay: {},
      timed: {}
    }
  }

  getKeysForDateSpan(dateSpan: DateSpan): string[] {
    if (dateSpan.allDay) {
      return [ 'allDay' ]
    } else {
      return [ 'timed' ]
    }
  }

  getKeysForEventDef(eventDef: EventDef): string[] {
    if (!eventDef.allDay) {
      return [ 'timed' ]
    } else if (hasBgRendering(eventDef)) {
      return [ 'timed', 'allDay' ]
    } else {
      return [ 'allDay' ]
    }
  }

}
