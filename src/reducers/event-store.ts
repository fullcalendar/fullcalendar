import UnzonedRange from '../models/UnzonedRange'
import { DateInput } from '../datelib/env'
import Calendar from '../Calendar'
import { filterHash, parseClassName, refineProps, ClassNameInput } from './utils'
import { expandRecurring } from './recurring-events'

// types

export interface EventInput {
  id?: string | number
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
  rendering?: '' | 'background' | 'inverse-background' | 'none'
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
  rendering: '' | 'background' | 'inverse-background' | 'none'
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

export interface EventStore {
  defs: { [defId: string]: EventDef }
  instances: { [instanceId: string]: EventInstance }
}

interface EventDateInfo {
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

// reducing

export function reduceEventStore(eventStore: EventStore, action: any, calendar: Calendar): EventStore {
  switch(action.type) {

    case 'RECEIVE_EVENT_SOURCE':
      eventStore = excludeSource(eventStore, action.sourceId)
      addRawEvents(eventStore, action.sourceId, action.fetchRange, action.rawEvents, calendar)
      return eventStore

    case 'CLEAR_EVENT_SOURCE': // TODO: wire up
      return excludeSource(eventStore, action.sourceId)

    default:
      return eventStore
  }
}

function excludeSource(eventStore: EventStore, sourceId: string): EventStore {
  return {
    defs: filterHash(eventStore.defs, function(def: EventDef) {
      return def.sourceId !== sourceId
    }),
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return eventStore.defs[instance.defId].sourceId !== sourceId
    })
  }
}

function addRawEvents(eventStore: EventStore, sourceId: string, fetchRange: UnzonedRange, rawEvents: any, calendar: Calendar) {
  rawEvents.forEach(function(rawEvent: EventInput) {
    let leftoverProps = {}
    let recurringDateInfo = expandRecurring(rawEvent, fetchRange, calendar, leftoverProps)

    if (recurringDateInfo) {
      let def = addDef(eventStore, sourceId, leftoverProps, recurringDateInfo.isAllDay, recurringDateInfo.hasEnd)

      for (let range of recurringDateInfo.ranges) {
        addInstance(eventStore, def.defId, range)
      }
    } else {
      let dateInfo = parseDateInfo(rawEvent, sourceId, calendar, leftoverProps)

      if (dateInfo) {
        let def = addDef(eventStore, sourceId, leftoverProps, dateInfo.isAllDay, dateInfo.hasEnd)
        addInstance(eventStore, def.defId, dateInfo.range, dateInfo.forcedStartTzo, dateInfo.forcedEndTzo)
      }
    }
  })
}

// parsing + adding

function addDef(eventStore: EventStore, sourceId: string, raw: EventInput, isAllDay: boolean, hasEnd: boolean): EventDef {
  let leftovers = {} as any
  let def = refineProps(raw, SIMPLE_DEF_PROPS, leftovers)
  let defId = String(guid++)

  if (leftovers.id != null) {
    def.publicId = String(leftovers.id)
    delete leftovers.id
  } else {
    def.publicId = null
  }

  def.defId = defId
  def.sourceId = sourceId
  def.isAllDay = isAllDay
  def.hasEnd = hasEnd
  def.extendedProps = leftovers

  eventStore.defs[defId] = def
  return def
}

function addInstance(
  eventStore: EventStore,
  defId: string,
  range: UnzonedRange,
  forcedStartTzo: number = null,
  forcedEndTzo: number = null
): EventInstance {
  let instanceId = String(guid++)
  let instance = { instanceId, defId, range, forcedStartTzo, forcedEndTzo }

  eventStore.instances[instanceId] = instance
  return instance
}

function parseDateInfo(rawEvent: EventInput, sourceId: string, calendar: Calendar, leftoverProps: any): EventDateInfo {
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
    hasEnd = false
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
