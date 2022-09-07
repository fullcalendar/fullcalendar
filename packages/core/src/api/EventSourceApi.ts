import { EventSource } from '../structs/event-source'
import { CalendarContext } from '../CalendarContext'

// no public types yet. when there are, export from:
// import {} from './api-type-deps'

export class EventSourceApi {
  constructor(
    private context: CalendarContext,
    public internalEventSource: EventSource<any>, // rename?
  ) {
  }

  remove() {
    this.context.dispatch({
      type: 'REMOVE_EVENT_SOURCE',
      sourceId: this.internalEventSource.sourceId,
    })
  }

  refetch() {
    this.context.dispatch({
      type: 'FETCH_EVENT_SOURCES',
      sourceIds: [this.internalEventSource.sourceId],
      isRefetch: true,
    })
  }

  get id(): string {
    return this.internalEventSource.publicId
  }

  get url(): string {
    return this.internalEventSource.meta.url
  }

  get format(): string {
    return this.internalEventSource.meta.format // TODO: bad. not guaranteed
  }
}
