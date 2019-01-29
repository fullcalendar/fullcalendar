import { refineProps } from '../util/misc'
import { DateInput } from '../datelib/env'
import Calendar from '../Calendar'
import { DateRange } from '../datelib/date-range'
import { startOfDay } from '../datelib/marker'
import { parseRecurring } from './recurring-event'
import { Duration } from '../datelib/duration'
import { UnscopedEventUiInput, EventUi, processUnscopedUiProps } from '../component/event-ui'
import { __assign } from 'tslib'

/*
Utils for parsing event-input data. Each util parses a subset of the event-input's data.
It's up to the caller to stitch them together into an aggregate object like an EventStore.
*/

export type EventRenderingChoice = '' | 'background' | 'inverse-background' | 'none'

export interface EventNonDateInput extends UnscopedEventUiInput {
  id?: string | number
  groupId?: string | number
  title?: string
  url?: string
  rendering?: EventRenderingChoice
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

export interface EventDef {
  defId: string
  sourceId: string
  publicId: string
  groupId: string
  allDay: boolean
  hasEnd: boolean
  recurringDef: { typeId: number, typeData: any, duration: Duration | null } | null
  title: string
  url: string
  rendering: EventRenderingChoice
  ui: EventUi
  extendedProps: any
}

export interface EventInstance {
  instanceId: string
  defId: string
  range: DateRange
  forcedStartTzo: number | null
  forcedEndTzo: number | null
}

export interface EventTuple {
  def: EventDef
  instance: EventInstance | null
}

export type EventInstanceHash = { [instanceId: string]: EventInstance }
export type EventDefHash = { [defId: string]: EventDef }

export const NON_DATE_PROPS = {
  id: String,
  groupId: String,
  title: String,
  url: String,
  rendering: String,
  extendedProps: null
}

export const DATE_PROPS = {
  start: null,
  date: null, // alias for start
  end: null,
  allDay: null
}

let uid = 0


export function parseEvent(raw: EventInput, sourceId: string, calendar: Calendar, allowOpenRange?: boolean): EventTuple | null {
  let allDayDefault = computeIsAllDayDefault(sourceId, calendar)
  let leftovers0 = {}
  let recurringRes = parseRecurring(
    raw, // raw, but with single-event stuff stripped out
    allDayDefault,
    calendar.dateEnv,
    calendar.pluginSystem.hooks.recurringTypes,
    leftovers0 // will populate with non-recurring props
  )

  if (recurringRes) {
    let def = parseEventDef(leftovers0, sourceId, recurringRes.allDay, Boolean(recurringRes.duration), calendar)

    def.recurringDef = { // don't want all the props from recurringRes. TODO: more efficient way to do this
      typeId: recurringRes.typeId,
      typeData: recurringRes.typeData,
      duration: recurringRes.duration
    }

    return { def, instance: null }

  } else {
    let leftovers1 = {}
    let singleRes = parseSingle(raw, allDayDefault, calendar, leftovers1, allowOpenRange)

    if (singleRes) {
      let def = parseEventDef(leftovers1, sourceId, singleRes.allDay, singleRes.hasEnd, calendar)
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
export function parseEventDef(raw: EventNonDateInput, sourceId: string, allDay: boolean, hasEnd: boolean, calendar: Calendar): EventDef {
  let leftovers = {}
  let def = pluckNonDateProps(raw, calendar, leftovers) as EventDef

  def.defId = String(uid++)
  def.sourceId = sourceId
  def.allDay = allDay
  def.hasEnd = hasEnd

  for (let eventDefParser of calendar.pluginSystem.hooks.eventDefParsers) {
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


export function createEventInstance(
  defId: string,
  range: DateRange,
  forcedStartTzo?: number,
  forcedEndTzo?: number
): EventInstance {
  return {
    instanceId: String(uid++),
    defId,
    range,
    forcedStartTzo: forcedStartTzo == null ? null : forcedStartTzo,
    forcedEndTzo: forcedEndTzo == null ? null : forcedEndTzo
  }
}


function parseSingle(raw: EventInput, allDayDefault: boolean | null, calendar: Calendar, leftovers?, allowOpenRange?: boolean) {
  let props = pluckDateProps(raw, leftovers)
  let allDay = props.allDay
  let startMeta
  let startMarker = null
  let hasEnd = false
  let endMeta
  let endMarker = null

  startMeta = calendar.dateEnv.createMarkerMeta(props.start)

  if (startMeta) {
    startMarker = startMeta.marker
  } else if (!allowOpenRange) {
    return null
  }

  if (props.end != null) {
    endMeta = calendar.dateEnv.createMarkerMeta(props.end)
  }

  if (allDay == null) {
    if (allDayDefault != null) {
      allDay = allDayDefault
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
    hasEnd = calendar.opt('forceEventDuration') || false

    endMarker = calendar.dateEnv.add(
      startMarker,
      allDay ?
        calendar.defaultAllDayEventDuration :
        calendar.defaultTimedEventDuration
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


function pluckNonDateProps(raw: EventInput, calendar: Calendar, leftovers?) {
  let preLeftovers = {}
  let props = refineProps(raw, NON_DATE_PROPS, {}, preLeftovers)
  let ui = processUnscopedUiProps(preLeftovers, calendar, leftovers)

  props.publicId = props.id
  delete props.id

  props.ui = ui

  return props
}


function computeIsAllDayDefault(sourceId: string, calendar: Calendar): boolean | null {
  let res = null

  if (sourceId) {
    let source = calendar.state.eventSources[sourceId]
    res = source.allDayDefault
  }

  if (res == null) {
    res = calendar.opt('allDayDefault')
  }

  return res
}
