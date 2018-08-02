import { refineProps } from '../util/misc'
import { parseClassName, ClassNameInput } from '../util/html'
import { DateInput } from '../datelib/env'
import UnzonedRange from '../models/UnzonedRange'
import Calendar from '../Calendar'

export type RenderingChoices = '' | 'background' | 'inverse-background' | 'none'

export interface EventInput {
  id?: string | number
  groupId?: string | number
  start?: DateInput
  end?: DateInput
  date?: DateInput
  isAllDay?: boolean
  title?: string
  url?: string
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  constraint?: any
  overlap?: any
  rendering?: RenderingChoices
  className?: ClassNameInput
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  [extendedPropName: string]: any
}

export interface EventDef {
  defId: string
  sourceId: string
  publicId: string | null
  groupId: string | null
  hasEnd: boolean
  isAllDay: boolean
  title: string | null
  url: string | null
  editable: boolean | null
  startEditable: boolean | null
  durationEditable: boolean | null
  constraint: any
  overlap: any
  rendering: RenderingChoices
  className: string[]
  color: string | null
  backgroundColor: string | null
  borderColor: string | null
  textColor: string | null
  extendedProps: any
}

export interface EventInstance {
  instanceId: string
  defId: string
  range: UnzonedRange
  forcedStartTzo: number | null
  forcedEndTzo: number | null
}

export interface EventDateInfo {
  isAllDay: boolean
  hasEnd: boolean
  range: UnzonedRange
  forcedStartTzo: number | null
  forcedEndTzo: number | null
}


// vars

const DATE_PROPS = {
  start: null,
  date: null,
  end: null,
  isAllDay: null
}

const SIMPLE_DEF_PROPS = {
  groupId: String,
  title: String,
  url: String,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: null,
  overlap: null,
  rendering: String,
  className: parseClassName,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String
}

let guid = 0



export function parseDef(raw: EventInput, sourceId: string, isAllDay: boolean, hasEnd: boolean): EventDef {
  let leftovers = {} as any
  let def = refineProps(raw, SIMPLE_DEF_PROPS, leftovers)

  // TODO: allow explicit extendedProps hash

  if (leftovers.id != null) {
    def.publicId = String(leftovers.id)
    delete leftovers.id
  } else {
    def.publicId = null
  }

  def.defId = String(guid++)
  def.sourceId = sourceId
  def.isAllDay = isAllDay
  def.hasEnd = hasEnd
  def.extendedProps = leftovers

  return def
}

export function createInstance(
  defId: string,
  range: UnzonedRange,
  forcedStartTzo: number | null = null,
  forcedEndTzo: number | null = null
): EventInstance {
  let instanceId = String(guid++)
  return { instanceId, defId, range, forcedStartTzo, forcedEndTzo }
}

export function parseDateInfo(rawEvent: EventInput, sourceId: string, calendar: Calendar, leftoverProps: any): EventDateInfo | null {
  let dateProps = refineProps(rawEvent, DATE_PROPS, leftoverProps)
  let rawStart = dateProps.start
  let startMeta
  let hasEnd = false
  let endMeta = null
  let endMarker = null

  if (rawStart == null) {
    rawStart = dateProps.date
  }

  if (rawStart != null) {
    startMeta = calendar.dateEnv.createMarkerMeta(rawStart)
  }
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

  if (endMeta) {
    endMarker = endMeta.marker

    if (endMarker <= startMeta.marker) {
      endMarker = null
    }
  }

  if (endMarker) {
    hasEnd = true
  } else {
    hasEnd = calendar.opt('forceEventDuration') || false

    endMarker = calendar.dateEnv.add(
      startMeta.marker,
      isAllDay ?
        calendar.defaultAllDayEventDuration :
        calendar.defaultTimedEventDuration
    )
  }

  return {
    isAllDay,
    hasEnd,
    range: new UnzonedRange(startMeta.marker, endMarker),
    forcedStartTzo: startMeta.forcedTimeZoneOffset, // TODO: rename to 'tzo' elsewhere
    forcedEndTzo: endMeta ? endMeta.forcedTimeZoneOffset : null
  }
}
