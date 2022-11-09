import {
  Splitter,
  hasBgRendering,
  EventDef,
  DateSpan,
} from '@fullcalendar/core/internal'

export class AllDaySplitter extends Splitter {
  getKeyInfo() {
    return {
      allDay: {},
      timed: {},
    }
  }

  getKeysForDateSpan(dateSpan: DateSpan): string[] {
    if (dateSpan.allDay) {
      return ['allDay']
    }

    return ['timed']
  }

  getKeysForEventDef(eventDef: EventDef): string[] {
    if (!eventDef.allDay) {
      return ['timed']
    }

    if (hasBgRendering(eventDef)) {
      return ['timed', 'allDay']
    }

    return ['allDay']
  }
}
