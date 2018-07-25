import UnzonedRange from '../models/UnzonedRange'
import { DateInput } from '../datelib/env'
import Calendar from '../Calendar'
import { filterHash } from '../util/object'
import { parseClassName, refineProps, ClassNameInput } from './utils'
import { expandRecurring } from './recurring-events'
import { applyMutation } from './event-mutation'

// types

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

export type EventInstanceHash = { [instanceId: string]: EventInstance }
export type EventDefHash = { [defId: string]: EventDef }

export interface EventStore {
  defs: EventDefHash
  instances: EventInstanceHash
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
  let eventSource

  switch(action.type) {

    case 'RECEIVE_EVENT_SOURCE':
      eventSource = calendar.state.eventSources[action.sourceId]

      if (eventSource.latestFetchId === action.fetchId) { // this is checked in event-sources too :(
        eventStore = excludeSource(eventStore, action.sourceId)
        addRawEvents(eventStore, action.sourceId, action.fetchRange, action.rawEvents, calendar)
      }

      return eventStore

    case 'CLEAR_EVENT_SOURCE': // TODO: wire up
      return excludeSource(eventStore, action.sourceId)

    case 'MUTATE_EVENTS':
      return applyMutation(eventStore, action.instanceId, action.mutation, calendar)

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
      let def = parseDef(leftoverProps, sourceId, recurringDateInfo.isAllDay, recurringDateInfo.hasEnd)
      eventStore.defs[def.defId] = def

      for (let range of recurringDateInfo.ranges) {
        let instance = createInstance(def.defId, range)
        eventStore.instances[instance.instanceId] = instance
      }

    } else {
      let dateInfo = parseDateInfo(rawEvent, sourceId, calendar, leftoverProps)

      if (dateInfo) {
        let def = parseDef(leftoverProps, sourceId, dateInfo.isAllDay, dateInfo.hasEnd)
        let instance = createInstance(def.defId, dateInfo.range, dateInfo.forcedStartTzo, dateInfo.forcedEndTzo)

        eventStore.defs[def.defId] = def
        eventStore.instances[instance.instanceId] = instance
      }
    }
  })
}

// parsing + creating

export function parseDef(raw: EventInput, sourceId: string, isAllDay: boolean, hasEnd: boolean): EventDef {
  let leftovers = {} as any
  let def = refineProps(raw, SIMPLE_DEF_PROPS, leftovers)

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
  forcedStartTzo: number = null,
  forcedEndTzo: number = null
): EventInstance {
  let instanceId = String(guid++)
  return { instanceId, defId, range, forcedStartTzo, forcedEndTzo }
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
