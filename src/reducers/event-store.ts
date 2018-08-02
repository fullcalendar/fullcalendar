import Calendar from '../Calendar'
import { filterHash } from '../util/object'
import { applyMutationToRelated, mergeStores } from '../structs/event-mutation'
import { EventDef, EventInstance } from '../structs/event'
import { EventStore, addRawEvents } from '../structs/event-store'

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
      return applyMutationToRelated(eventStore, action.instanceId, action.mutation, calendar)

    case 'ADD_EVENTS':
      return mergeStores(eventStore, action.eventStore)

    case 'REMOVE_EVENTS':
      return excludeEventInstances(eventStore, action.eventStore)

    default:
      return eventStore
  }
}

function excludeEventInstances(eventStore: EventStore, removals: EventStore) {
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

