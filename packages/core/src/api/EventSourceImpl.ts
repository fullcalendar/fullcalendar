import { EventSource } from '../structs/event-source.js'
import { CalendarContext } from '../CalendarContext.js'
import { EventSourceApi } from './EventSourceApi.js'

export class EventSourceImpl implements EventSourceApi {
  constructor(
    private context: CalendarContext,
    public internalEventSource: EventSource<any>, // rename?
  ) {
  }

  remove(): void {
    this.context.dispatch({
      type: 'REMOVE_EVENT_SOURCE',
      sourceId: this.internalEventSource.sourceId,
    })
  }

  refetch(): void {
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
