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
  let leftovers0 = {} as any
  let dateProps = pluckDateProps(raw, leftovers0)
  let leftovers1 = {} as any
  let def = parseEventDef(raw, sourceId, calendar, leftovers1)
  let instance: EventInstance = null

  if (dateProps.start !== null) {
    let instanceRes = parseEventInstance(dateProps, def.defId, sourceId, calendar)

    if (instanceRes) {
      def.isAllDay = instanceRes.isAllDay
      def.hasEnd = instanceRes.hasEnd
      instance = instanceRes.instance
    } else {
      return null // TODO: give a warning
    }
  } else {
    let recurringRes = parseRecurring(
      leftovers0, // non-date props and other non-standard props
      leftovers1, // dest
      calendar.dateEnv
    )

    if (recurringRes) {
      def.isAllDay = recurringRes.isAllDay
      def.hasEnd = Boolean(recurringRes.duration)
      def.recurringDef = {
        typeId: recurringRes.typeId,
        typeData: recurringRes.typeData,
        duration: recurringRes.duration
      }
    } else {
      return null // TODO: give a warning
    }
  }

  def.extendedProps = assignTo(leftovers1, def.extendedProps)

  return { def, instance }
}


/*
Will NOT populate extendedProps with the leftover properties.
Will NOT populate date-related props.
The EventNonDateInput has been normalized (id => publicId, etc).
*/
export function parseEventDef(raw: EventNonDateInput, sourceId: string, calendar: Calendar, leftovers?: any): EventDef {
  let def = pluckNonDateProps(raw, calendar, leftovers) as EventDef

  def.defId = String(uid++)
  def.sourceId = sourceId

  if (!def.extendedProps) {
    def.extendedProps = {}
  }

  // help out EventApi::extendedProps from having user modify props
  Object.freeze(def.extendedProps)

  return def
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


/*
The EventDateInput has been normalized (date => start, etc).
*/
function parseEventInstance(dateProps: EventDateInput, defId: string, sourceId: string, calendar: Calendar) {
  let startMeta
  let startMarker
  let hasEnd = false
  let endMeta = null
  let endMarker = null

  startMeta = calendar.dateEnv.createMarkerMeta(dateProps.start)

  if (!startMeta) {
    return null
  }

  if (dateProps.end != null) {
    endMeta = calendar.dateEnv.createMarkerMeta(dateProps.end)
  }

  let isAllDay = dateProps.isAllDay
  if (isAllDay == null && sourceId) {
    let source = calendar.state.eventSources[sourceId]
    isAllDay = source.allDayDefault
  }
  if (isAllDay == null) {
    isAllDay = calendar.opt('allDayDefault')
  }
  if (isAllDay == null) {
    isAllDay = startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified)
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
    instance: createEventInstance(
      defId,
      { start: startMarker, end: endMarker },
      startMeta.forcedTzo,
      endMeta ? endMeta.forcedTzo : null
    )
  }
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
