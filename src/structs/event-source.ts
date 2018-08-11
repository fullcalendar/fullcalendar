import { ClassNameInput, parseClassName } from '../util/html'
import { refineProps } from '../util/misc'
import { EventInput } from './event'
import Calendar from '../Calendar'
import { DateRange } from '../datelib/date-range'
import { EventSourceFunc } from '../event-sources/func-event-source'

/*
Parsing and normalization of the EventSource data type, which defines how event data is fetched.
Contains the plugin system for defining new types if event sources.

TODO: "EventSource" is the same name as a built-in type in TypeScript. Rethink.
*/

export type EventInputTransformer = (eventInput: EventInput) => EventInput | null
export type EventSourceSuccessHandler = (eventInputs: EventInput[]) => void
export type EventSourceFailureHandler = (errorObj: any) => void

export interface ExtendedEventSourceInput {
  id?: string | number
  allDayDefault?: boolean
  eventDataTransform?: EventInputTransformer
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  overlap?: any
  constraint?: any
  rendering?: string
  className?: ClassNameInput
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  success?: EventSourceSuccessHandler
  failure?: EventSourceFailureHandler

  // array (TODO: how to move this to array-event-source?)
  events?: EventInput[]

  // json feed (TODO: how to move this to json-feed-event-source?)
  url?: string
  method?: string
  data?: object | (() => object)
  startParam?: string
  endParam?: string
  timezoneParam?: string

  [otherProp: string]: any // in case plugins want more props
}

export type EventSourceInput =
  ExtendedEventSourceInput | // object in extended form
  EventSourceFunc | // just a function
  string // a URL for a JSON feed

export interface EventSource {
  sourceId: string
  sourceDefId: number // one of the few IDs that's a NUMBER not a string
  meta: any
  publicId: string
  isFetching: boolean
  latestFetchId: string
  fetchRange: DateRange | null
  allDayDefault: boolean | null
  eventDataTransform: EventInputTransformer
  editable: boolean | null
  startEditable: boolean | null
  durationEditable: boolean | null
  overlap: any
  constraint: any
  rendering: string
  className: string[]
  backgroundColor: string
  borderColor: string
  textColor: string
  success: EventSourceSuccessHandler
  failure: EventSourceFailureHandler
}

export type EventSourceHash = { [sourceId: string]: EventSource }

export type EventSourceFetcher = (
  arg: {
    eventSource: EventSource
    calendar: Calendar
    range: DateRange
  },
  success: EventSourceSuccessHandler,
  failure: EventSourceFailureHandler
) => void

export interface EventSourceDef {
  parseMeta: (raw: EventSourceInput) => object | null
  fetch: EventSourceFetcher
}

const SIMPLE_SOURCE_PROPS = {
  allDayDefault: Boolean,
  eventDataTransform: Function,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  overlap: null,
  constraint: null,
  rendering: String,
  className: parseClassName,
  backgroundColor: String,
  borderColor: String,
  textColor: String,
  success: Function,
  failure: Function
}

let defs: EventSourceDef[] = []
let uid = 0

// NOTE: if we ever want to remove defs,
// we need to null out the entry in the array, not delete it,
// because our event source IDs rely on the index.
export function registerEventSourceDef(def: EventSourceDef) {
  defs.push(def)
}

export function getEventSourceDef(id: number): EventSourceDef {
  return defs[id]
}

export function parseEventSource(raw: EventSourceInput): EventSource | null {
  for (let i = defs.length - 1; i >= 0; i--) { // later-added plugins take precedence
    let def = defs[i]
    let meta = def.parseMeta(raw)

    if (meta) {
      return parseEventSourceProps(
        typeof raw === 'object' ? raw : {},
        meta,
        i
      )
    }
  }

  return null
}

function parseEventSourceProps(raw: ExtendedEventSourceInput, meta: object, sourceDefId: number): EventSource {
  let props = refineProps(raw, SIMPLE_SOURCE_PROPS) as EventSource

  props.isFetching = false
  props.latestFetchId = ''
  props.fetchRange = null
  props.publicId = String(raw.id || '')
  props.sourceId = String(uid++)
  props.sourceDefId = sourceDefId
  props.meta = meta

  if (typeof raw.color === 'string') {
    if (!props.backgroundColor) {
      props.backgroundColor = raw.color
    }
    if (!props.borderColor) {
      props.borderColor = raw.color
    }
  }

  return props
}
