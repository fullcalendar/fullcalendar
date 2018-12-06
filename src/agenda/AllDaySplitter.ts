import Splitter from '../component/event-splitting'
import { hasBgRendering } from '../component/event-rendering'
import { EventDef } from '../structs/event'
import { DateSpan } from '../structs/date-span'

export default class AllDaySplitter extends Splitter {

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
