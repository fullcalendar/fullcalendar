import {
  EventInput,
  EventDef,
  EventDefHash,
  EventInstance,
  EventInstanceHash,
  parseEvent,
  EventTuple
} from './event'
import { filterHash } from '../util/object'
import { ReducerContext } from '../reducers/ReducerContext'

/*
A data structure that encapsulates EventDefs and EventInstances.
Utils for parsing this data from raw EventInputs.
Utils for manipulating an EventStore.
*/

export interface EventStore {
  defs: EventDefHash
  instances: EventInstanceHash
}

export function parseEvents(
  rawEvents: EventInput[],
  sourceId: string,
  context: ReducerContext,
  allowOpenRange?: boolean
): EventStore {
  let eventStore = createEmptyEventStore()

  for (let rawEvent of rawEvents) {
    let tuple = parseEvent(rawEvent, sourceId, context, allowOpenRange)

    if (tuple) {
      eventTupleToStore(tuple, eventStore)
    }
  }

  return eventStore
}

export function eventTupleToStore(tuple: EventTuple, eventStore: EventStore = createEmptyEventStore()) {
  eventStore.defs[tuple.def.defId] = tuple.def

  if (tuple.instance) {
    eventStore.instances[tuple.instance.instanceId] = tuple.instance
  }

  return eventStore
}

// retrieves events that have the same groupId as the instance specified by `instanceId`
// or they are the same as the instance.
// why might instanceId not be in the store? an event from another calendar?
export function getRelevantEvents(eventStore: EventStore, instanceId: string): EventStore {
  let instance = eventStore.instances[instanceId]

  if (instance) {
    let def = eventStore.defs[instance.defId]

    // get events/instances with same group
    let newStore = filterEventStoreDefs(eventStore, function(lookDef) {
      return isEventDefsGrouped(def, lookDef)
    })

    // add the original
    // TODO: wish we could use eventTupleToStore or something like it
    newStore.defs[def.defId] = def
    newStore.instances[instance.instanceId] = instance

    return newStore
  }

  return createEmptyEventStore()
}

function isEventDefsGrouped(def0: EventDef, def1: EventDef): boolean {
  return Boolean(def0.groupId && def0.groupId === def1.groupId)
}

export function createEmptyEventStore(): EventStore {
  return { defs: {}, instances: {} }
}

export function mergeEventStores(store0: EventStore, store1: EventStore): EventStore {
  return {
    defs: { ...store0.defs, ...store1.defs },
    instances: { ...store0.instances, ...store1.instances }
  }
}

export function filterEventStoreDefs(eventStore: EventStore, filterFunc: (eventDef: EventDef) => boolean): EventStore {
  let defs = filterHash(eventStore.defs, filterFunc)
  let instances = filterHash(eventStore.instances, function(instance: EventInstance) {
    return defs[instance.defId] // still exists?
  })
  return { defs, instances }
}
