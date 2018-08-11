import Calendar from '../Calendar'
import { EventSource } from '../structs/event-source'

export default class EventSourceApi {

  calendar: Calendar
  internalEventSource: EventSource

  constructor(calendar: Calendar, internalEventSource: EventSource) {
    this.calendar = calendar
    this.internalEventSource = internalEventSource
  }

  remove() {
    // TODO
  }

  refetch() {
    // TODO
  }

}
