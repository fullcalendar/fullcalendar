import Calendar from '../Calendar'
import { filterHash } from '../util/object'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { EventDef, EventInstance, EventInput, EventInstanceHash } from '../structs/event'
import { EventStore, parseEventStore, mergeEventStores, getRelatedEvents, createEmptyEventStore } from '../structs/event-store'
import { Action } from './types'
import { EventSourceHash, EventSource } from '../structs/event-source'
import { DateRange } from '../datelib/date-range'

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

    case 'REMOVE_EVENT_SOURCE':
      return filterDefs(eventStore, function(eventDef: EventDef) {
        return eventDef.sourceId !== action.sourceId
      })

    case 'REMOVE_ALL_EVENT_SOURCES':
      return filterDefs(eventStore, function(eventDef: EventDef) {
        return !eventDef.sourceId
      })

    case 'REMOVE_ALL_EVENTS':
      return createEmptyEventStore()

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
      fetchRange,
      calendar,
      filterDefs( // dest
        eventStore,
        function(eventDef: EventDef) {
          return eventDef.sourceId !== eventSource.sourceId && !eventDef.isTemporary
        }
      )
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

// has extra bonus feature of removing temporary events
function filterDefs(eventStore: EventStore, filterFunc: (eventDef: EventDef) => boolean): EventStore {
  let defs = filterHash(eventStore.defs, filterFunc)
  let instances = filterHash(eventStore.instances, function(instance: EventInstance) {
    return defs[instance.defId] // still exists?
  })
  return { defs, instances }
}

function applyMutationToRelated(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let related = getRelatedEvents(eventStore, instanceId)
  related = applyMutationToEventStore(related, mutation, calendar)
  return mergeEventStores(eventStore, related)
}
