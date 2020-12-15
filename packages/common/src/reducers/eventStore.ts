import { filterHash, mapHash } from '../util/object'
import { EventDef } from '../structs/event-def'
import { EventInstance, EventInstanceHash } from '../structs/event-instance'
import { EventInput } from '../structs/event-parse'
import {
  EventStore,
  mergeEventStores,
  createEmptyEventStore,
  filterEventStoreDefs,
  excludeSubEventStore,
  parseEvents,
} from '../structs/event-store'
import { Action } from './Action'
import { EventSourceHash, EventSource } from '../structs/event-source'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import { DateEnv } from '../datelib/env'
import { CalendarContext } from '../CalendarContext'
import { expandRecurring } from '../structs/recurring-event'

export function reduceEventStore(
  eventStore: EventStore,
  action: Action,
  eventSources: EventSourceHash,
  dateProfile: DateProfile,
  context: CalendarContext,
): EventStore {
  switch (action.type) {
    case 'RECEIVE_EVENTS': // raw
      return receiveRawEvents(
        eventStore,
        eventSources[action.sourceId],
        action.fetchId,
        action.fetchRange,
        action.rawEvents,
        context,
      )

    case 'ADD_EVENTS': // already parsed, but not expanded
      return addEvent(
        eventStore,
        action.eventStore, // new ones
        dateProfile ? dateProfile.activeRange : null,
        context,
      )

    case 'RESET_EVENTS':
      return action.eventStore

    case 'MERGE_EVENTS': // already parsed and expanded
      return mergeEventStores(eventStore, action.eventStore)

    case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
    case 'NEXT':
    case 'CHANGE_DATE':
    case 'CHANGE_VIEW_TYPE':
      if (dateProfile) {
        return expandRecurring(eventStore, dateProfile.activeRange, context)
      }
      return eventStore

    case 'REMOVE_EVENTS':
      return excludeSubEventStore(eventStore, action.eventStore)

    case 'REMOVE_EVENT_SOURCE':
      return excludeEventsBySourceId(eventStore, action.sourceId)

    case 'REMOVE_ALL_EVENT_SOURCES':
      return filterEventStoreDefs(eventStore, (eventDef: EventDef) => (
        !eventDef.sourceId // only keep events with no source id
      ))

    case 'REMOVE_ALL_EVENTS':
      return createEmptyEventStore()

    default:
      return eventStore
  }
}

function receiveRawEvents(
  eventStore: EventStore,
  eventSource: EventSource<any>,
  fetchId: string,
  fetchRange: DateRange | null,
  rawEvents: EventInput[],
  context: CalendarContext,
): EventStore {
  if (
    eventSource && // not already removed
    fetchId === eventSource.latestFetchId // TODO: wish this logic was always in event-sources
  ) {
    let subset = parseEvents(
      transformRawEvents(rawEvents, eventSource, context),
      eventSource,
      context,
    )

    if (fetchRange) {
      subset = expandRecurring(subset, fetchRange, context)
    }

    return mergeEventStores(
      excludeEventsBySourceId(eventStore, eventSource.sourceId),
      subset,
    )
  }

  return eventStore
}

function transformRawEvents(rawEvents, eventSource: EventSource<any>, context: CalendarContext) {
  let calEachTransform = context.options.eventDataTransform
  let sourceEachTransform = eventSource ? eventSource.eventDataTransform : null

  if (sourceEachTransform) {
    rawEvents = transformEachRawEvent(rawEvents, sourceEachTransform)
  }

  if (calEachTransform) {
    rawEvents = transformEachRawEvent(rawEvents, calEachTransform)
  }

  return rawEvents
}

function transformEachRawEvent(rawEvents, func) {
  let refinedEvents

  if (!func) {
    refinedEvents = rawEvents
  } else {
    refinedEvents = []

    for (let rawEvent of rawEvents) {
      let refinedEvent = func(rawEvent)

      if (refinedEvent) {
        refinedEvents.push(refinedEvent)
      } else if (refinedEvent == null) {
        refinedEvents.push(rawEvent)
      } // if a different falsy value, do nothing
    }
  }

  return refinedEvents
}

function addEvent(eventStore: EventStore, subset: EventStore, expandRange: DateRange | null, context: CalendarContext): EventStore {
  if (expandRange) {
    subset = expandRecurring(subset, expandRange, context)
  }

  return mergeEventStores(eventStore, subset)
}

export function rezoneEventStoreDates(eventStore: EventStore, oldDateEnv: DateEnv, newDateEnv: DateEnv): EventStore {
  let { defs } = eventStore

  let instances = mapHash(eventStore.instances, (instance: EventInstance): EventInstance => {
    let def = defs[instance.defId]

    if (def.allDay || def.recurringDef) {
      return instance // isn't dependent on timezone
    }
    return {
      ...instance,
      range: {
        start: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.start, instance.forcedStartTzo)),
        end: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.end, instance.forcedEndTzo)),
      },
      forcedStartTzo: newDateEnv.canComputeOffset ? null : instance.forcedStartTzo,
      forcedEndTzo: newDateEnv.canComputeOffset ? null : instance.forcedEndTzo,
    }
  })

  return { defs, instances }
}

function excludeEventsBySourceId(eventStore: EventStore, sourceId: string) {
  return filterEventStoreDefs(eventStore, (eventDef: EventDef) => eventDef.sourceId !== sourceId)
}

// QUESTION: why not just return instances? do a general object-property-exclusion util
export function excludeInstances(eventStore: EventStore, removals: EventInstanceHash): EventStore {
  return {
    defs: eventStore.defs,
    instances: filterHash(eventStore.instances, (instance: EventInstance) => !removals[instance.instanceId]),
  }
}
