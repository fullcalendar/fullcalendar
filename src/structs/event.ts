import { refineProps } from '../util/misc'
import { DateInput } from '../datelib/env'
import Calendar from '../Calendar'
import { assignTo } from '../util/object'
import { DateRange } from '../datelib/date-range'
import { startOfDay } from '../datelib/marker'
import { parseRecurring } from './recurring-event'
import { Duration } from '../datelib/duration'
import { UnscopedEventUiInput, EventUiPart, processUnscopedUiProps } from '../component/event-ui'

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
  ui: EventUiPart
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
  extendedProps: null
}

export const DATE_PROPS = {
  start: null,
  date: null, // alias for start
  end: null,
  allDay: null
}

let uid = 0


export function parseEvent(raw: EventInput, sourceId: string, calendar: Calendar): EventTuple | null {
  let leftovers0 = {}
  let allDayDefault = computeIsAllDayDefault(sourceId, calendar)
  let singleRes = parseSingle(raw, allDayDefault, calendar, leftovers0)

  if (singleRes) {
    let def = parseEventDef(leftovers0, sourceId, singleRes.allDay, singleRes.hasEnd, calendar)
    let instance = createEventInstance(def.defId, singleRes.range, singleRes.forcedStartTzo, singleRes.forcedEndTzo)

    return { def, instance }

  } else {
    let leftovers1 = {}
    let recurringRes = parseRecurring(
      leftovers0, // raw, but with single-event stuff stripped out
      calendar.dateEnv,
      leftovers1 // the new leftovers
    )

    if (recurringRes) {
      let allDay =
        (raw.allDay != null) ? Boolean(raw.allDay) : // need to get this from `raw` because already stripped out of `leftovers0`
          (allDayDefault != null ? allDayDefault :
            recurringRes.allDay) // fall back to the recurring date props LAST

      let def = parseEventDef(leftovers1, sourceId, allDay, Boolean(recurringRes.duration), calendar)

      def.recurringDef = { // TODO: more efficient way to do this
        typeId: recurringRes.typeId,
        typeData: recurringRes.typeData,
        duration: recurringRes.duration
      }

      return { def, instance: null }
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

  def.extendedProps = assignTo(leftovers, def.extendedProps || {})

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


function parseSingle(raw: EventInput, allDayDefault: boolean | null, calendar: Calendar, leftovers?) {
  let props = pluckDateProps(raw, leftovers)
  let allDay = props.allDay
  let startMeta
  let startMarker
  let hasEnd = false
  let endMeta = null
  let endMarker = null

  startMeta = calendar.dateEnv.createMarkerMeta(props.start)

  if (!startMeta) {
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
      allDay = startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified)
    }
  }

  startMarker = startMeta.marker

  if (allDay) {
    startMarker = startOfDay(startMarker)
  }

  if (endMeta) {
    endMarker = endMeta.marker

    if (endMarker <= startMarker) {
      endMarker = null
    } else if (allDay) {
      endMarker = startOfDay(endMarker)
    }
  }

  if (endMarker) {
    hasEnd = true
  } else {
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
    forcedStartTzo: startMeta.forcedTzo,
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
