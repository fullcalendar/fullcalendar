import { EventSource } from '../structs/event-source'
import { CalendarContext } from '../CalendarContext'

export class EventSourceApi {

  constructor(
    private context: CalendarContext,
    public internalEventSource: EventSource<any> // rename?
  ) {
  }

  remove() {
    this.context.dispatch({
      type: 'REMOVE_EVENT_SOURCE',
      sourceId: this.internalEventSource.sourceId
    })
  }

  refetch() {
    this.context.dispatch({
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
