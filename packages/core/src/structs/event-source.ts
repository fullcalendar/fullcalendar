import { EventInput, EventInputTransformer } from './event'
import { DateRange } from '../datelib/date-range'
import { EventUi } from '../component/event-ui'
import { ReducerContext } from '../reducers/ReducerContext'

/*
TODO: "EventSource" is the same name as a built-in type in TypeScript. Rethink.
*/

export type EventSourceError = {
  message: string
  response?: any // an XHR or something like it
  [otherProp: string]: any
}


export type EventSourceSuccessResponseHandler = (rawData: any, response: any) => EventInput[] | void
export type EventSourceErrorResponseHandler = (error: EventSourceError) => void


export interface EventSource {
  _raw: any
  sourceId: string
  sourceDefId: number // one of the few IDs that's a NUMBER not a string
  meta: any
  publicId: string
  isFetching: boolean
  latestFetchId: string
  fetchRange: DateRange | null
  defaultAllDay: boolean | null
  eventDataTransform: EventInputTransformer
  ui: EventUi
  success: EventSourceSuccessResponseHandler | null
  failure: EventSourceErrorResponseHandler | null
  extendedProps: any // undocumented
}


export type EventSourceHash = { [sourceId: string]: EventSource }


export type EventSourceFetcher = (
  arg: {
    eventSource: EventSource
    range: DateRange
    context: ReducerContext
  },
  success: (res: { rawEvents: EventInput[], xhr?: XMLHttpRequest }) => void,
  failure: (error: EventSourceError) => void
) => (void | PromiseLike<EventInput[]>)
