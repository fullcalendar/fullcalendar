import { EventInput, EventInputTransformer } from './event-parse'
import { EventSourceFunc } from '../event-sources/func-event-source'
import { ConstraintInput, AllowFunc } from './constraint'
import { EventSource, EventSourceSuccessResponseHandler, EventSourceErrorResponseHandler } from './event-source'
import { CalendarContext } from '../CalendarContext'
import { refineProps, guid } from '../util/misc'
import { processUnscopedUiProps } from '../component/event-ui'


export interface ExtendedEventSourceInput {
  id?: string | number // only accept number?
  defaultAllDay?: boolean
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


const SIMPLE_SOURCE_PROPS = {
  id: String,
  defaultAllDay: Boolean,
  eventDataTransform: Function,
  success: Function,
  failure: Function
}


export function parseEventSource(raw: EventSourceInput, context: CalendarContext): EventSource | null {
  let defs = context.pluginHooks.eventSourceDefs

  for (let i = defs.length - 1; i >= 0; i--) { // later-added plugins take precedence
    let def = defs[i]
    let meta = def.parseMeta(raw)

    if (meta) {
      let res = parseEventSourceProps(
        typeof raw === 'object' ? raw : {},
        meta,
        i,
        context
      )

      res._raw = raw
      return res
    }
  }

  return null
}


function parseEventSourceProps(raw: ExtendedEventSourceInput, meta: object, sourceDefId: number, context: CalendarContext): EventSource {
  let leftovers0 = {}
  let props = refineProps(raw, SIMPLE_SOURCE_PROPS, {}, leftovers0)
  let leftovers1 = {}
  let ui = processUnscopedUiProps(leftovers0, context, leftovers1)

  props.isFetching = false
  props.latestFetchId = ''
  props.fetchRange = null
  props.publicId = String(raw.id || '')
  props.sourceId = guid()
  props.sourceDefId = sourceDefId
  props.meta = meta
  props.ui = ui
  props.extendedProps = leftovers1

  return props as EventSource
}
