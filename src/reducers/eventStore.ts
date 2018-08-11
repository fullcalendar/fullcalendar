import Calendar from '../Calendar'
import { filterHash } from '../util/object'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { EventDef, EventInstance, EventInput, EventInstanceHash } from '../structs/event'
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

    case 'REMOVE_EVENT_INSTANCES':
      return excludeInstances(eventStore, action.instances)

    case 'REMOVE_EVENT_SOURCE':
      return excludeSource(eventStore, action.sourceId)

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
      excludeSource( // dest
        eventStore,
        eventSource.sourceId,
        true // also remove events with isTemporary:true
      )
    )
  }

  return eventStore
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
function excludeSource(eventStore: EventStore, sourceId: string, temporaryMatch?: boolean): EventStore {
  let defs = filterHash(eventStore.defs, function(def: EventDef) {
    return def.sourceId !== sourceId || def.isTemporary === temporaryMatch
  })
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
