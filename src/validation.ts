import { EventStore, expandRecurring, eventTupleToStore, mapEventInstances, filterEventStoreDefs, isEventDefsGrouped } from './structs/event-store'
import Calendar from './Calendar'
import { DateSpan, parseOpenDateSpan, OpenDateSpanInput, OpenDateSpan, isSpanPropsEqual, isSpanPropsMatching, buildDateSpanApi, DateSpanApi } from './structs/date-span'
import { EventInstance, EventDef, EventTuple, parseEvent } from './structs/event'
import { EventSourceHash } from './structs/event-source'
import { rangeContainsRange, rangesIntersect } from './datelib/date-range'
import EventApi from './api/EventApi'

// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | OpenDateSpanInput | { [timeOrRecurringProp: string]: any }
export type Constraint = 'businessHours' | string | OpenDateSpan | EventTuple
export type Overlap = boolean | ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type Allow = (span: DateSpanApi, movingEvent: EventApi | null) => boolean

interface ValidationEntity {
  dateSpan: DateSpan
  event: EventTuple | null
  constraint: Constraint | null // in addition to calendar's
  overlap: boolean | null // in addition to calendar's. granular entities can't provide functions
  allow: Allow | null // in addition to calendar's
}

export function isEventsValid(eventStore: EventStore, calendar: Calendar): boolean {
  return isEntitiesValid(
    eventStoreToEntities(eventStore, calendar.state.eventSources),
    normalizeConstraint(calendar.opt('eventConstraint'), calendar),
    calendar.opt('eventOverlap'),
    calendar.opt('eventAllow'),
    calendar
  )
}

export function isSelectionValid(selection: DateSpan, calendar: Calendar): boolean {
  return isEntitiesValid(
    [ { dateSpan: selection, event: null, constraint: null, overlap: null, allow: null } ],
    normalizeConstraint(calendar.opt('selectConstraint'), calendar),
    calendar.opt('selectOverlap'),
    calendar.opt('selectAllow'),
    calendar
  )
}

function isEntitiesValid(
  entities: ValidationEntity[],
  globalConstraint: Constraint | null,
  globalOverlap: Overlap | null,
  globalAllow: Allow | null,
  calendar: Calendar
): boolean {
  let state = calendar.state

  for (let entity of entities) {
    if (
      !isDateSpanWithinConstraint(entity.dateSpan, entity.constraint, calendar) ||
      !isDateSpanWithinConstraint(entity.dateSpan, globalConstraint, calendar)
    ) {
      return false
    }
  }

  let eventEntities = eventStoreToEntities(state.eventStore, state.eventSources)

  for (let subjectEntity of entities) {
    for (let eventEntity of eventEntities) {
      if (
        ( // not comparing the same/related event
          !subjectEntity.event ||
          !eventEntity.event ||
          isEventsCollidable(subjectEntity.event, eventEntity.event)
        ) &&
        dateSpansCollide(subjectEntity.dateSpan, eventEntity.dateSpan) // a collision!
      ) {
        if (
          subjectEntity.overlap === false ||
          (eventEntity.overlap === false && subjectEntity.event) || // the eventEntity doesn't like two events colliding
          !isOverlapValid(eventEntity.event, subjectEntity.event, globalOverlap, calendar)
        ) {
          return false
        }
      }
    }
  }

  for (let entity of entities) {
    if (
      !isDateSpanAllowed(entity.dateSpan, entity.event, entity.allow, calendar) ||
      !isDateSpanAllowed(entity.dateSpan, entity.event, globalAllow, calendar)
    ) {
      return false
    }
  }

  return true
}

// do we want to compare these events for collision?
// say no if events are the same, or if they share a groupId
function isEventsCollidable(event0: EventTuple, event1: EventTuple): boolean {
  if (event0.instance.instanceId === event1.instance.instanceId) {
    return false
  }

  return !isEventDefsGrouped(event0.def, event1.def)
}

function eventStoreToEntities(eventStore: EventStore, eventSources: EventSourceHash): ValidationEntity[] {
  return mapEventInstances(eventStore, function(eventInstance: EventInstance, eventDef: EventDef): ValidationEntity {
    let eventSource = eventSources[eventDef.sourceId]
    let constraint = eventDef.constraint as Constraint
    let overlap = eventDef.overlap as boolean

    if (constraint == null && eventSource) {
      constraint = eventSource.constraint
    }

    if (overlap == null && eventSource) {
      overlap = eventSource.overlap

      if (overlap == null) {
        overlap = true
      }
    }

    return {
      dateSpan: eventToDateSpan(eventDef, eventInstance),
      event: { def: eventDef, instance: eventInstance },
      constraint,
      overlap,
      allow: eventSource ? eventSource.allow : null
    }
  })
}

function isDateSpanWithinConstraint(subjectSpan: DateSpan, constraint: Constraint | null, calendar: Calendar): boolean {

  if (constraint === null) {
    return true // doesn't care
  }

  let constrainingSpans: DateSpan[] = constraintToSpans(constraint, subjectSpan, calendar)

  for (let constrainingSpan of constrainingSpans) {
    if (dateSpanContainsOther(constrainingSpan, subjectSpan)) {
      return true
    }
  }

  return false // not contained by any one of the constrainingSpans
}

function constraintToSpans(constraint: Constraint, subjectSpan: DateSpan, calendar: Calendar): DateSpan[] {

  if (constraint === 'businessHours') {
    let store = getPeerBusinessHours(subjectSpan, calendar)
    store = expandRecurring(store, subjectSpan.range, calendar)
    return eventStoreToDateSpans(store)

  } else if (typeof constraint === 'string') { // an ID
    let store = filterEventStoreDefs(calendar.state.eventStore, function(eventDef) {
      return eventDef.groupId === constraint
    })
    return eventStoreToDateSpans(store)

  } else if (typeof constraint === 'object' && constraint) { // non-null object

    if ((constraint as EventTuple).def) { // an event definition (actually, a tuple)
      let store = eventTupleToStore(constraint as EventTuple)
      store = expandRecurring(store, subjectSpan.range, calendar)
      return eventStoreToDateSpans(store)

    } else {
      return [ constraint as OpenDateSpan ] // already parsed datespan
    }

  }

  return []
}

function isOverlapValid(still: EventTuple, moving: EventTuple | null, overlap: Overlap | null, calendar: Calendar): boolean {
  if (typeof overlap === 'boolean') {
    return overlap
  } else if (typeof overlap === 'function') {
    return Boolean(
      overlap(
        new EventApi(calendar, still.def, still.instance),
        moving ? new EventApi(calendar, moving.def, moving.instance) : null
      )
    )
  }

  return true
}

function isDateSpanAllowed(dateSpan: DateSpan, moving: EventTuple | null, allow: Allow | null, calendar: Calendar): boolean {
  if (typeof allow === 'function') {
    return Boolean(
      allow(
        buildDateSpanApi(dateSpan, calendar.dateEnv),
        moving ? new EventApi(calendar, moving.def, moving.instance) : null
      )
    )
  }

  return true
}

function dateSpansCollide(span0: DateSpan, span1: DateSpan): boolean {
  return rangesIntersect(span0.range, span1.range) && isSpanPropsEqual(span0, span1)
}

function dateSpanContainsOther(outerSpan: DateSpan, subjectSpan: DateSpan): boolean {
  return rangeContainsRange(outerSpan.range, subjectSpan.range) &&
    isSpanPropsMatching(subjectSpan, outerSpan) // subjectSpan has all the props that outerSpan has?
}

function eventStoreToDateSpans(store: EventStore): DateSpan[] {
  return mapEventInstances(store, function(instance: EventInstance, def: EventDef) {
    return eventToDateSpan(def, instance)
  })
}

// TODO: plugin
export function eventToDateSpan(def: EventDef, instance: EventInstance): DateSpan {
  return {
    isAllDay: def.isAllDay,
    range: instance.range
  }
}

// TODO: plugin
function getPeerBusinessHours(subjectSpan: DateSpan, calendar: Calendar): EventStore {
  return calendar.view.businessHours // accessing view :(
}

export function normalizeConstraint(input: ConstraintInput, calendar: Calendar): Constraint | null {
  if (typeof input === 'object' && input) { // non-null object
    let span = parseOpenDateSpan(input, calendar.dateEnv)

    if (span === null || span.range.start || span.range.end) {
      return span
    } else { // if completely-open range, assume it's a recurring event (prolly with startTime/endTime)
      return parseEvent(input, '', calendar)
    }

  } else if (input != null) {
    return String(input)
  } else {
    return null
  }
}
