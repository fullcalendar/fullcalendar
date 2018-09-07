import { refineProps } from '../util/misc'
import { parseClassName, ClassNameInput } from '../util/html'
import { DateInput } from '../datelib/env'
import Calendar from '../Calendar'
import { assignTo } from '../util/object'
import { DateRange } from '../datelib/date-range'
import { startOfDay } from '../datelib/marker'
import { parseRecurring } from './recurring-event'
import { ConstraintInput, Constraint, normalizeConstraint } from '../validation'
import { Duration } from '../datelib/duration'

/*
Utils for parsing event-input data. Each util parses a subset of the event-input's data.
It's up to the caller to stitch them together into an aggregate object like an EventStore.
*/

export type EventRenderingChoice = '' | 'background' | 'inverse-background' | 'none'

export interface EventNonDateInput {
  id?: string | number
  groupId?: string | number
  title?: string
  url?: string
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  constraint?: ConstraintInput
  overlap?: boolean
  rendering?: EventRenderingChoice
  classNames?: ClassNameInput // accept both
  className?: ClassNameInput //
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: object
  [extendedProp: string]: any
}

export interface EventDateInput {
  start?: DateInput
  end?: DateInput
  date?: DateInput
  isAllDay?: boolean
}

export type EventInput = EventNonDateInput & EventDateInput

export interface EventDef {
  defId: string
  sourceId: string
  publicId: string
  groupId: string
  isAllDay: boolean
  hasEnd: boolean
  recurringDef: { typeId: number, typeData: any, duration: Duration | null } | null
  title: string
  url: string
  startEditable: boolean | null
  durationEditable: boolean | null
  constraint: Constraint | null
  overlap: boolean | null // does not allow full Overlap data type
  rendering: EventRenderingChoice
  classNames: string[]
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: object
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

const NON_DATE_PROPS = {
  id: String,
  groupId: String,
  title: String,
  url: String,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: null,
  overlap: Boolean,
  rendering: String,
  classNames: parseClassName,
  className: parseClassName,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String,
  extendedProps: null
}

const DATE_PROPS = {
  start: null,
  date: null, // alias for start
  end: null,
  isAllDay: null
}

let uid = 0


export function parseEvent(raw: EventInput, sourceId: string, calendar: Calendar): EventTuple | null {
  let leftovers0 = {}
  let isAllDayDefault = computeIsAllDayDefault(sourceId, calendar)
  let singleRes = parseSingle(raw, isAllDayDefault, calendar, leftovers0)

  if (singleRes) {
    let def = parseEventDef(leftovers0, sourceId, singleRes.isAllDay, singleRes.hasEnd, calendar)
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
      let isAllDay =
        (raw.isAllDay != null) ? Boolean(raw.isAllDay) : // need to get this from `raw` because already stripped out of `leftovers0`
          (isAllDayDefault != null ? isAllDayDefault :
            recurringRes.isAllDay) // fall back to the recurring date props LAST

      let def = parseEventDef(leftovers1, sourceId, isAllDay, Boolean(recurringRes.duration), calendar)

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
export function parseEventDef(raw: EventNonDateInput, sourceId: string, isAllDay: boolean, hasEnd: boolean, calendar: Calendar): EventDef {
  let leftovers = {}
  let def = pluckNonDateProps(raw, calendar, leftovers) as EventDef

  def.defId = String(uid++)
  def.sourceId = sourceId
  def.isAllDay = isAllDay
  def.hasEnd = hasEnd
  def.extendedProps = assignTo(leftovers, def.extendedProps || {})

  // help out EventApi::extendedProps from having user modify props
  Object.freeze(def.extendedProps)

  return def
}


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


function parseSingle(raw: EventInput, isAllDayDefault: boolean | null, calendar: Calendar, leftovers?) {
  let props = pluckDateProps(raw, leftovers)
  let isAllDay = props.isAllDay
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

  if (isAllDay == null) {
    if (isAllDayDefault != null) {
      isAllDay = isAllDayDefault
    } else {
      // fall back to the date props LAST
      isAllDay = startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified)
    }
  }

  startMarker = startMeta.marker

  if (isAllDay) {
    startMarker = startOfDay(startMarker)
  }

  if (endMeta) {
    endMarker = endMeta.marker

    if (endMarker <= startMarker) {
      endMarker = null
    } else if (isAllDay) {
      endMarker = startOfDay(endMarker)
    }
  }

  if (endMarker) {
    hasEnd = true
  } else {
    hasEnd = calendar.opt('forceEventDuration') || false

    endMarker = calendar.dateEnv.add(
      startMarker,
      isAllDay ?
        calendar.defaultAllDayEventDuration :
        calendar.defaultTimedEventDuration
    )
  }

  return {
    isAllDay,
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


function pluckNonDateProps(raw: EventInput, calendar: Calendar, leftovers: any) {
  let props = refineProps(raw, NON_DATE_PROPS, {}, leftovers)

  props.publicId = props.id
  props.classNames = props.classNames.concat(props.className)

  if (props.constraint) {
    props.constraint = normalizeConstraint(props.constraint, calendar)
  }

  if (props.startEditable == null) {
    props.startEditable = props.editable
  }

  if (props.durationEditable == null) {
    props.durationEditable = props.editable
  }

  if (!props.backgroundColor) {
    props.backgroundColor = props.color
  }

  if (!props.borderColor) {
    props.borderColor = props.color
  }

  delete props.id
  delete props.className
  delete props.editable
  delete props.color

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
