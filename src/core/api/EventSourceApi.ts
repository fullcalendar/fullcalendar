import Calendar from '../Calendar'
import { EventSource } from '../structs/event-source'

export default class EventSourceApi {

  calendar: Calendar
  internalEventSource: EventSource // rename?

  constructor(calendar: Calendar, internalEventSource: EventSource) {
    this.calendar = calendar
    this.internalEventSource = internalEventSource
  }

  remove() {
    this.calendar.dispatch({
      type: 'REMOVE_EVENT_SOURCE',
      sourceId: this.internalEventSource.sourceId
    })
  }

  refetch() {
    this.calendar.dispatch({
      type: 'FETCH_EVENT_SOURCES',
      sourceIds: [ this.internalEventSource.sourceId ]
    })
  }

  get id(): string {
    return this.internalEventSource.publicId
  }

  // only relevant to json-feed event sources
  get url(): string {
    return this.internalEventSource.meta.url
  }

}
