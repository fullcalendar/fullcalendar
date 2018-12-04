import { Splitter } from '../component/event-splitting'
import { hasBgRendering } from '../component/event-rendering'
import { EventDef } from '../structs/event'

export default class AllDaySplitter extends Splitter {

  constructor() {
    super([ 'allDay', 'timed' ])
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
