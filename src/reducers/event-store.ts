import Calendar from '../Calendar'
import { filterHash } from '../util/object'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { EventDef, EventInstance } from '../structs/event'
import { EventStore, parseEventStore, mergeEventStores, getRelatedEvents } from '../structs/event-store'

// reducing

export function reduceEventStore(eventStore: EventStore, action: any, calendar: Calendar): EventStore {
  let eventSource

  switch(action.type) {

    case 'RECEIVE_EVENT_SOURCE':
      eventSource = calendar.state.eventSources[action.sourceId]

      if (eventSource.latestFetchId === action.fetchId) { // this is checked in event-sources too :(
        return parseEventStore(
          action.rawEvents,
          action.sourceId,
          action.fetchRange,
          calendar,
          excludeSource(eventStore, action.sourceId)
        )
      } else {
        return eventStore
      }

    case 'CLEAR_EVENT_SOURCE': // TODO: wire up
      return excludeSource(eventStore, action.sourceId)

    case 'MUTATE_EVENTS':
      return applyMutationToRelated(eventStore, action.instanceId, action.mutation, calendar)

    case 'ADD_EVENTS':
      return mergeEventStores(eventStore, action.eventStore)

    case 'REMOVE_EVENTS':
      return excludeEventInstances(eventStore, action.eventStore)

    default:
      return eventStore
  }
}

function excludeEventInstances(eventStore: EventStore, removals: EventStore): EventStore {
  return {
    defs: eventStore.defs,
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return !removals.instances[instance.instanceId]
    })
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

function applyMutationToRelated(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let relatedStore = getRelatedEvents(eventStore, instanceId)
  relatedStore = applyMutationToEventStore(relatedStore, mutation, calendar)
  return mergeEventStores(eventStore, relatedStore)
}

