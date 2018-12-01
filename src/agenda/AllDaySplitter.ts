import { Splitter } from '../component/event-splitting'
import { EventUi } from '../component/event-ui'
import { hasBgRendering } from '../component/event-rendering'
import { EventDef } from '../structs/event'

export default class AllDaySplitter extends Splitter {

  constructor() {
    super([ 'allDay', 'timed' ])
  }

  getKeysForEventDef(eventDef: EventDef, eventUi: EventUi): string[] {
    if (!eventDef.allDay) {
      return [ 'timed' ]
    } else if (hasBgRendering(eventUi)) {
      return [ 'timed', 'allDay' ]
    } else {
      return [ 'allDay' ]
    }
  }

}
