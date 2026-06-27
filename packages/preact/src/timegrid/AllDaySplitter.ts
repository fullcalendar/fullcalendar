import { Splitter } from '../component-util/event-splitting'
import { hasBgRendering } from '../component-util/event-rendering'
import { EventDef } from '../structs/event-def'
import { DateSpan } from '../structs/date-span'

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
