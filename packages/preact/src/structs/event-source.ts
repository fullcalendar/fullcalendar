import { EventInput, EventInputTransformer } from './event-parse'
import { DateRange } from '@full-ui/headless-calendar'
import { EventUi } from '../component-util/event-ui'
import { CalendarContext } from '../CalendarContext'
import { CalendarApiImpl } from '../api/CalendarApiImpl'
import { Dictionary } from '../options'

/*
TODO: "EventSource" is the same name as a built-in type in TypeScript. Rethink.
*/

export type EventSourceSuccessResponseHandler = (this: CalendarApiImpl, rawData: any, response: any) => EventInput[] | void
export type EventSourceErrorResponseHandler = (error: Error) => void

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

export interface EventSourceFetcherRes {
  rawEvents: EventInput[]
  response?: Response
}

export type EventSourceFetcher<Meta> = (
  data: {
    eventSource: EventSource<Meta>
    range: DateRange
    isRefetch: boolean
    context: CalendarContext
  },
  successCallback: (res: EventSourceFetcherRes) => void,
  errorCallback: (error: Error) => void,
) => void
