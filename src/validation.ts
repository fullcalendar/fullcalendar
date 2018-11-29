import { EventStore, expandRecurring, eventTupleToStore, mapEventInstances, filterEventStoreDefs, isEventDefsGrouped } from './structs/event-store'
import Calendar from './Calendar'
import { DateSpan, parseOpenDateSpan, OpenDateSpanInput, OpenDateSpan, isSpanPropsEqual, isSpanPropsMatching, buildDateSpanApi, DateSpanApi } from './structs/date-span'
import { EventInstance, EventDef, EventTuple, parseEvent } from './structs/event'
import { rangeContainsRange, rangesIntersect } from './datelib/date-range'
import EventApi from './api/EventApi'
import { EventUiHash } from './component/event-ui'

// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | OpenDateSpanInput | { [timeOrRecurringProp: string]: any }
export type Constraint = 'businessHours' | string | OpenDateSpan | EventTuple
export type Overlap = boolean | ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type Allow = (span: DateSpanApi, movingEvent: EventApi | null) => boolean

interface ValidationEntity {
  dateSpan: DateSpan
  event: EventTuple | null
  constraints: Constraint[]
  overlaps: Overlap[]
  allows: Allow[]
}

export function isEventsValid(eventStore: EventStore, eventUis: EventUiHash, calendar: Calendar): boolean {
  return isEntitiesValid(
    eventStoreToEntities(eventStore, eventUis),
    calendar
  )
}

export function isSelectionValid(selection: DateSpan, calendar: Calendar): boolean {

  // TODO: separate util for this. in scoped part!?
  let constraint = normalizeConstraint(calendar.opt('selectConstraint'), calendar)
  let overlap = calendar.opt('selectOverlap')
  let allow = calendar.opt('selectAllow')

  return isEntitiesValid(
    [ {
      dateSpan: selection,
      event: null,
      constraints: constraint != null ? [ constraint ] : [],
      overlaps: overlap != null ? [ overlap ] : [],
      allows: allow != null ? [ allow ] : []
    } ],
    calendar
  )
}

function isEntitiesValid(entities: ValidationEntity[], calendar: Calendar): boolean {

  for (let entity of entities) {
    for (let constraint of entity.constraints) {
      if (!isDateSpanWithinConstraint(entity.dateSpan, constraint, calendar)) {
        return false
      }
    }
  }

  // is this efficient?
  let eventEntities = eventStoreToEntities(calendar.state.eventStore, calendar.renderableEventUis)

  for (let subjectEntity of entities) {
    for (let eventEntity of eventEntities) {
      if (considerEntitiesForOverlap(eventEntity, subjectEntity)) {

        // the "subject" (the thing being dragged) must be an event if we are comparing it to other events for overlap
        if (subjectEntity.event) {
          for (let overlap of eventEntity.overlaps) {
            if (!isOverlapValid(eventEntity.event, subjectEntity.event, overlap, calendar)) {
              return false
            }
          }
        }

        for (let overlap of subjectEntity.overlaps) {
          if (!isOverlapValid(eventEntity.event, subjectEntity.event, overlap, calendar)) {
            return false
          }
        }
      }
    }
  }

  for (let entity of entities) {
    for (let allow of entity.allows) {
      if (!isDateSpanAllowed(entity.dateSpan, entity.event, allow, calendar)) {
        return false
      }
    }
  }

  return true
}

function considerEntitiesForOverlap(entity0: ValidationEntity, entity1: ValidationEntity) {
  return ( // not comparing the same/related event
    !entity0.event ||
    !entity1.event ||
    isEventsCollidable(entity0.event, entity1.event)
  ) &&
  dateSpansCollide(entity0.dateSpan, entity1.dateSpan) // a collision!
}

// do we want to compare these events for collision?
// say no if events are the same, or if they share a groupId
function isEventsCollidable(event0: EventTuple, event1: EventTuple): boolean {
  if (event0.instance.instanceId === event1.instance.instanceId) {
    return false
  }

  return !isEventDefsGrouped(event0.def, event1.def)
}

function eventStoreToEntities(eventStore: EventStore, eventUis: EventUiHash): ValidationEntity[] {
  return mapEventInstances(eventStore, function(eventInstance: EventInstance, eventDef: EventDef): ValidationEntity {
    let eventUi = eventUis[eventDef.defId]

    return {
      dateSpan: eventToDateSpan(eventDef, eventInstance),
      event: { def: eventDef, instance: eventInstance },
      constraints: eventUi.constraints,
      overlaps: eventUi.overlaps,
      allows: eventUi.allows
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

function isOverlapValid(stillEvent: EventTuple, movingEvent: EventTuple | null, overlap: Overlap | null, calendar: Calendar): boolean {
  if (typeof overlap === 'boolean') {
    return overlap
  } else if (typeof overlap === 'function') {
    return Boolean(
      overlap(
        new EventApi(calendar, stillEvent.def, stillEvent.instance),
        movingEvent ? new EventApi(calendar, movingEvent.def, movingEvent.instance) : null
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
    allDay: def.allDay,
    range: instance.range
  }
}

// TODO: plugin
function getPeerBusinessHours(subjectSpan: DateSpan, calendar: Calendar): EventStore {
  return calendar.component.view.props.businessHours // accessing view :(
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
