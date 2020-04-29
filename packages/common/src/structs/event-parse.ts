import { refineProps, guid } from '../util/misc'
import { DateInput } from '../datelib/env'
import { startOfDay } from '../datelib/marker'
import { parseRecurring } from './recurring-event'
import { UnscopedEventUiInput, processUnscopedUiProps } from '../component/event-ui'
import { __assign } from 'tslib'
import { CalendarContext } from '../CalendarContext'
import { EventDef, DATE_PROPS, NON_DATE_PROPS } from './event-def'
import { EventInstance, createEventInstance } from './event-instance'
import { EventSource } from './event-source'

/*
Utils for parsing event-input data. Each util parses a subset of the event-input's data.
It's up to the caller to stitch them together into an aggregate object like an EventStore.
*/

export interface EventNonDateInput extends UnscopedEventUiInput {
  id?: string | number
  groupId?: string | number
  title?: string
  url?: string
  extendedProps?: object
  [extendedProp: string]: any
}

export interface EventDateInput {
  start?: DateInput
  end?: DateInput
  date?: DateInput
  allDay?: boolean
}

export type EventInput = EventNonDateInput & EventDateInput
export type EventInputTransformer = (eventInput: EventInput) => EventInput | null

export interface EventTuple {
  def: EventDef
  instance: EventInstance | null
}


export function parseEvent(raw: EventInput, eventSource: EventSource | null, context: CalendarContext, allowOpenRange?: boolean): EventTuple | null {
  let defaultAllDay = computeIsDefaultAllDay(eventSource, context)
  let leftovers0 = {}
  let recurringRes = parseRecurring(
    raw, // raw, but with single-event stuff stripped out
    defaultAllDay,
    context.dateEnv,
    context.pluginHooks.recurringTypes,
    leftovers0 // will populate with non-recurring props
  )

  if (recurringRes) {
    let def = parseEventDef(leftovers0, eventSource ? eventSource.sourceId : '', recurringRes.allDay, Boolean(recurringRes.duration), context)

    def.recurringDef = { // don't want all the props from recurringRes. TODO: more efficient way to do this
      typeId: recurringRes.typeId,
      typeData: recurringRes.typeData,
      duration: recurringRes.duration
    }

    return { def, instance: null }

  } else {
    let leftovers1 = {}
    let singleRes = parseSingle(raw, defaultAllDay, context, leftovers1, allowOpenRange)

    if (singleRes) {
      let def = parseEventDef(leftovers1, eventSource ? eventSource.sourceId : '', singleRes.allDay, singleRes.hasEnd, context)
      let instance = createEventInstance(def.defId, singleRes.range, singleRes.forcedStartTzo, singleRes.forcedEndTzo)

      return { def, instance }
    }
  }

  return null
}


/*
Will NOT populate extendedProps with the leftover properties.
Will NOT populate date-related props.
The EventNonDateInput has been normalized (id => publicId, etc).
*/
export function parseEventDef(raw: EventNonDateInput, sourceId: string, allDay: boolean, hasEnd: boolean, context: CalendarContext): EventDef {
  let leftovers = {}
  let def = pluckNonDateProps(raw, context, leftovers) as EventDef

  def.defId = guid()
  def.sourceId = sourceId
  def.allDay = allDay
  def.hasEnd = hasEnd

  for (let eventDefParser of context.pluginHooks.eventDefParsers) {
    let newLeftovers = {}
    eventDefParser(def, leftovers, newLeftovers)
    leftovers = newLeftovers
  }

  def.extendedProps = __assign(leftovers, def.extendedProps || {})

  // help out EventApi from having user modify props
  Object.freeze(def.ui.classNames)
  Object.freeze(def.extendedProps)

  return def
}

export type eventDefParserFunc = (def: EventDef, props: any, leftovers: any) => void


function parseSingle(raw: EventInput, defaultAllDay: boolean | null, context: CalendarContext, leftovers?, allowOpenRange?: boolean) {
  let props = pluckDateProps(raw, leftovers)
  let allDay = props.allDay
  let startMeta
  let startMarker = null
  let hasEnd = false
  let endMeta
  let endMarker = null

  startMeta = context.dateEnv.createMarkerMeta(props.start)

  if (startMeta) {
    startMarker = startMeta.marker
  } else if (!allowOpenRange) {
    return null
  }

  if (props.end != null) {
    endMeta = context.dateEnv.createMarkerMeta(props.end)
  }

  if (allDay == null) {
    if (defaultAllDay != null) {
      allDay = defaultAllDay
    } else {
      // fall back to the date props LAST
      allDay = (!startMeta || startMeta.isTimeUnspecified) &&
        (!endMeta || endMeta.isTimeUnspecified)
    }
  }

  if (allDay && startMarker) {
    startMarker = startOfDay(startMarker)
  }

  if (endMeta) {
    endMarker = endMeta.marker

    if (allDay) {
      endMarker = startOfDay(endMarker)
    }

    if (startMarker && endMarker <= startMarker) {
      endMarker = null
    }
  }

  if (endMarker) {
    hasEnd = true
  } else if (!allowOpenRange) {
    hasEnd = context.options.forceEventDuration || false

    endMarker = context.dateEnv.add(
      startMarker,
      allDay ?
        context.computedOptions.defaultAllDayEventDuration :
        context.computedOptions.defaultTimedEventDuration
    )
  }

  return {
    allDay,
    hasEnd,
    range: { start: startMarker, end: endMarker },
    forcedStartTzo: startMeta ? startMeta.forcedTzo : null,
    forcedEndTzo: endMeta ? endMeta.forcedTzo : null
  }
}


function pluckDateProps(raw: EventInput, leftovers: any) {
  let props = refineProps(raw, DATE_PROPS, {}, leftovers)

  props.start = (props.start !== null) ? props.start : props.date
  delete props.date

  return props
}


function pluckNonDateProps(raw: EventInput, context: CalendarContext, leftovers?) {
  let preLeftovers = {}
  let props = refineProps(raw, NON_DATE_PROPS, {}, preLeftovers)
  let ui = processUnscopedUiProps(preLeftovers, context, leftovers)

  props.publicId = props.id
  delete props.id

  props.ui = ui

  return props
}


function computeIsDefaultAllDay(eventSource: EventSource | null, context: CalendarContext): boolean | null {
  let res = null

  if (eventSource) {
    res = eventSource.defaultAllDay
  }

  if (res == null) {
    res = context.options.defaultAllDay
  }

  return res
}
