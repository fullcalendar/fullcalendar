import UnzonedRange from '../../models/UnzonedRange'
import EventDef from '../../models/event/EventDef'
import EventInstance from '../../models/event/EventInstance'

export default class EventRange {

  unzonedRange: UnzonedRange
  eventDef: EventDef
  eventInstance: EventInstance // optional


  constructor(unzonedRange, eventDef, eventInstance?) {
    this.unzonedRange = unzonedRange
    this.eventDef = eventDef

    if (eventInstance) {
      this.eventInstance = eventInstance
    }
  }

}
