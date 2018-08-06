import Calendar from '../Calendar'
import { filterHash, arrayToHash } from '../util/object'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { EventDef, EventInstance, EventInput } from '../structs/event'
import { EventStore, parseEventStore, mergeEventStores, getRelatedEvents } from '../structs/event-store'
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

    case 'REMOVE_EVENTS':
      return excludeInstances(eventStore, action.eventStore)

    case 'REMOVE_EVENT_SOURCES':
      if (action.sourceIds) {
        return excludeSources(eventStore, action.sourceIds)
      } else {
        return excludeNonSticky(eventStore)
      }

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
  if (fetchId === eventSource.latestFetchId) { // TODO: wish this logic was always in event-sources

    rawEvents = rawEvents.map(function(rawEvent: EventInput) {
      return eventSource.eventDataTransform(rawEvent) || rawEvent
    })

    return parseEventStore(
      rawEvents,
      eventSource.sourceId,
      fetchRange,
      calendar,
      excludeSources(eventStore, [ eventSource.sourceId ]) // dest
    )
  }

  return eventStore
}

function excludeInstances(eventStore: EventStore, removals: EventStore): EventStore {
  return {
    defs: eventStore.defs,
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return !removals.instances[instance.instanceId]
    })
  }
}

function excludeSources(eventStore: EventStore, sourceIds: string[]): EventStore {
  let idHash = arrayToHash(sourceIds)

  return {
    defs: filterHash(eventStore.defs, function(def: EventDef) {
      return idHash && !idHash[def.sourceId]
    }),
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return idHash && !idHash[eventStore.defs[instance.defId].sourceId]
    })
  }
}

// sticky events don't have source IDs
function excludeNonSticky(eventStore: EventStore): EventStore {
  return {
    defs: filterHash(eventStore.defs, function(def: EventDef) {
      return !def.sourceId // keep sticky
    }),
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return !eventStore.defs[instance.defId].sourceId // keep sticky
    })
  }
}

function applyMutationToRelated(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let related = getRelatedEvents(eventStore, instanceId)
  related = applyMutationToEventStore(related, mutation, calendar)
  return mergeEventStores(eventStore, related)
}
