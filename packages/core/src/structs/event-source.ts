import { EventInput, EventInputTransformer } from './event-parse.js'
import { DateRange } from '../datelib/date-range.js'
import { EventUi } from '../component/event-ui.js'
import { CalendarContext } from '../CalendarContext.js'
import { CalendarImpl } from '../api/CalendarImpl.js'
import { Dictionary } from '../options.js'

/*
TODO: "EventSource" is the same name as a built-in type in TypeScript. Rethink.
*/

export type EventSourceError = {
  message: string
  response?: any // an XHR or something like it
  [otherProp: string]: any
}

export type EventSourceSuccessResponseHandler = (this: CalendarImpl, rawData: any, response: any) => EventInput[] | void
export type EventSourceErrorResponseHandler = (error: EventSourceError) => void

export interface EventSource<Meta> {
  _raw: any
  sourceId: string
  sourceDefId: number // one of the few IDs that's a NUMBER not a string
  meta: Meta
  publicId: string
  isFetching: boolean
  latestFetchId: string
  fetchRange: DateRange | null
  defaultAllDay: boolean | null
  eventDataTransform: EventInputTransformer // best to have this here?
  ui: EventUi
  success: EventSourceSuccessResponseHandler | null
  failure: EventSourceErrorResponseHandler | null
  extendedProps: Dictionary // undocumented
}

export type EventSourceHash = { [sourceId: string]: EventSource<any> }

export type EventSourceFetcher<Meta> = (
  arg: {
    eventSource: EventSource<Meta>
    range: DateRange
    isRefetch: boolean
    context: CalendarContext
  },
  success: (res: { rawEvents: EventInput[], xhr?: XMLHttpRequest }) => void,
  failure: (error: EventSourceError) => void
) => (void | PromiseLike<EventInput[]>)
