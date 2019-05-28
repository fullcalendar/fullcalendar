import { refineProps } from '../util/misc'
import { EventInput } from './event'
import Calendar from '../Calendar'
import { DateRange } from '../datelib/date-range'
import { EventSourceFunc } from '../event-sources/func-event-source'
import { EventUi, processUnscopedUiProps } from '../component/event-ui'
import { ConstraintInput, AllowFunc } from '../validation'

/*
Parsing and normalization of the EventSource data type, which defines how event data is fetched.
Contains the plugin system for defining new types if event sources.

TODO: "EventSource" is the same name as a built-in type in TypeScript. Rethink.
*/

export type EventSourceError = {
  message: string
  response?: any // an XHR or something like it
  [otherProp: string]: any
}

export type EventInputTransformer = (eventInput: EventInput) => EventInput | null
export type EventSourceSuccessResponseHandler = (rawData: any, response: any) => EventInput[] | void
export type EventSourceErrorResponseHandler = (error: EventSourceError) => void

export interface ExtendedEventSourceInput {
  id?: string | number // only accept number?
  allDayDefault?: boolean
  eventDataTransform?: EventInputTransformer

  // array or function (TODO: move this to array-event-source/func-event-source?)
  events?: EventInput[] | EventSourceFunc

  // json feed (TODO: how to move this to json-feed-event-source?)
  url?: string
  method?: string
  extraParams?: object | (() => object)
  startParam?: string
  endParam?: string
  timeZoneParam?: string

  // for any network-related sources
  success?: EventSourceSuccessResponseHandler
  failure?: EventSourceErrorResponseHandler

  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  constraint?: ConstraintInput
  overlap?: boolean
  allow?: AllowFunc
  className?: string[] | string
  classNames?: string[] | string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  color?: string

  [otherProp: string]: any // in case plugins want more props
}

export type EventSourceInput =
  ExtendedEventSourceInput | // object in extended form
  EventSourceFunc | // just a function
  string // a URL for a JSON feed

export interface EventSource {
  _raw: any
  sourceId: string
  sourceDefId: number // one of the few IDs that's a NUMBER not a string
  meta: any
  publicId: string
  isFetching: boolean
  latestFetchId: string
  fetchRange: DateRange | null
  allDayDefault: boolean | null
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
    calendar: Calendar
    range: DateRange
  },
  success: (res: { rawEvents: EventInput[], xhr?: XMLHttpRequest }) => void,
  failure: (error: EventSourceError) => void
) => (void | PromiseLike<EventInput[]>)

export interface EventSourceDef {
  ignoreRange?: boolean
  parseMeta: (raw: EventSourceInput) => object | null
  fetch: EventSourceFetcher
}

const SIMPLE_SOURCE_PROPS = {
  id: String,
  allDayDefault: Boolean,
  eventDataTransform: Function,
  success: Function,
  failure: Function
}

let uid = 0

export function doesSourceNeedRange(eventSource: EventSource, calendar: Calendar) {
  let defs = calendar.pluginSystem.hooks.eventSourceDefs

  return !defs[eventSource.sourceDefId].ignoreRange
}

export function parseEventSource(raw: EventSourceInput, calendar: Calendar): EventSource | null {
  let defs = calendar.pluginSystem.hooks.eventSourceDefs

  for (let i = defs.length - 1; i >= 0; i--) { // later-added plugins take precedence
    let def = defs[i]
    let meta = def.parseMeta(raw)

    if (meta) {
      let res = parseEventSourceProps(
        typeof raw === 'object' ? raw : {},
        meta,
        i,
        calendar
      )

      res._raw = raw
      return res
    }
  }

  return null
}

function parseEventSourceProps(raw: ExtendedEventSourceInput, meta: object, sourceDefId: number, calendar: Calendar): EventSource {
  let leftovers0 = {}
  let props = refineProps(raw, SIMPLE_SOURCE_PROPS, {}, leftovers0)
  let leftovers1 = {}
  let ui = processUnscopedUiProps(leftovers0, calendar, leftovers1)

  props.isFetching = false
  props.latestFetchId = ''
  props.fetchRange = null
  props.publicId = String(raw.id || '')
  props.sourceId = String(uid++)
  props.sourceDefId = sourceDefId
  props.meta = meta
  props.ui = ui
  props.extendedProps = leftovers1

  return props as EventSource
}
