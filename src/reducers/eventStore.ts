import Calendar from '../Calendar'
import { filterHash } from '../util/object'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { EventDef, EventInstance, EventInput, EventInstanceHash } from '../structs/event'
import {
  EventStore,
  parseEventStore,
  mergeEventStores,
  getRelatedEvents,
  createEmptyEventStore,
  expandEventDefInstances,
  filterEventStoreDefs
} from '../structs/event-store'
import { Action } from './types'
import { EventSourceHash, EventSource, getEventSourceDef } from '../structs/event-source'
import { DateRange } from '../datelib/date-range'

// how to let user modify recurring def AFTER?

export default function(eventStore: EventStore, action: Action, sourceHash: EventSourceHash, calendar: Calendar): EventStore {
  switch(action.type) {

    case 'ADD_EVENTS': // already parsed
      return mergeEventStores(eventStore, action.eventStore)

    case 'RECEIVE_EVENTS': // raw
      return receiveEvents(
        eventStore,
        sourceHash[action.sourceId],
        action.fetchId,
        action.fetchRange,
        action.rawEvents,
        calendar
      )

    case 'MUTATE_EVENTS':
      return applyMutationToRelated(eventStore, action.instanceId, action.mutation, calendar)

    case 'REMOVE_EVENT_INSTANCES':
      return excludeInstances(eventStore, action.instances)

    case 'REMOVE_EVENT_DEF':
      return filterEventStoreDefs(eventStore, function(eventDef) {
        return eventDef.defId !== action.defId
      })

    case 'REMOVE_EVENT_SOURCE':
      return excludeEventsBySourceId(eventStore, action.sourceId)

    case 'REMOVE_ALL_EVENT_SOURCES':
      return filterEventStoreDefs(eventStore, function(eventDef: EventDef) {
        return !eventDef.sourceId // only keep events with no source id
      })

    case 'REMOVE_ALL_EVENTS':
      return createEmptyEventStore()

    case 'SET_DATE_PROFILE':
      return expandStaticEventDefs(eventStore, sourceHash, action.dateProfile.activeRange, calendar)

    default:
      return eventStore
  }
}

function receiveEvents(
  eventStore: EventStore,
  eventSource: EventSource,
  fetchId: string,
  fetchRange: DateRange,
  rawEvents: EventInput[],
  calendar: Calendar
): EventStore {

  if (
    eventSource && // not already removed
    fetchId === eventSource.latestFetchId // TODO: wish this logic was always in event-sources
  ) {

    rawEvents = runEventDataTransform(rawEvents, eventSource.eventDataTransform)
    rawEvents = runEventDataTransform(rawEvents, calendar.opt('eventDataTransform'))

    return parseEventStore(
      rawEvents,
      eventSource.sourceId,
      calendar,
      fetchRange,
      excludeEventsBySourceId(eventStore, eventSource.sourceId)
    )
  }

  return eventStore
}

function runEventDataTransform(rawEvents, func) {
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

function excludeInstances(eventStore: EventStore, removals: EventInstanceHash): EventStore {
  return {
    defs: eventStore.defs,
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return !removals[instance.instanceId]
    })
  }
}

function excludeEventsBySourceId(eventStore, sourceId) {
  return filterEventStoreDefs(eventStore, function(eventDef: EventDef) {
    return eventDef.sourceId !== sourceId
  })
}

function applyMutationToRelated(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let related = getRelatedEvents(eventStore, instanceId)
  related = applyMutationToEventStore(related, mutation, calendar)
  return mergeEventStores(eventStore, related)
}

function expandStaticEventDefs(eventStore: EventStore, eventSources: EventSourceHash, framingRange: DateRange, calendar: Calendar): EventStore {
  let staticSources = filterHash(eventSources, function(eventSource: EventSource) { // sources that won't change
    return eventSource.fetchRange && getEventSourceDef(eventSource.sourceDefId).singleFetch // only needs one fetch, and already got it
  }) as EventSourceHash

  let defs = eventStore.defs
  let instances = filterHash(eventStore.instances, function(eventInstance) {
    let def = defs[eventInstance.defId]

    return !def.recurringDef || !staticSources[def.sourceId]
  })

  for (let defId in defs) {
    expandEventDefInstances(defs[defId], framingRange, calendar, instances)
  }

  return { defs, instances }
}
