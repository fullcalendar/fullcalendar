import {
  EventInput,
  EventDef,
  EventDefHash,
  EventInstance,
  EventInstanceHash,
  createEventInstance,
  parseEvent,
  EventTuple
} from './event'
import { expandRecurringRanges } from './recurring-event'
import Calendar from '../Calendar'
import { assignTo, filterHash } from '../util/object'
import { DateRange } from '../datelib/date-range'

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
  calendar: Calendar
): EventStore {
  let eventStore = createEmptyEventStore()
  let transform = calendar.opt('eventDataTransform')

  if (transform) {
    rawEvents = transformRawEvents(rawEvents, transform)
  }

  for (let rawEvent of rawEvents) {
    let tuple = parseEvent(rawEvent, sourceId, calendar)

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

export function expandRecurring(eventStore: EventStore, framingRange: DateRange, calendar: Calendar): EventStore {
  let { defs, instances } = eventStore

  // remove existing recurring instances
  instances = filterHash(instances, function(instance: EventInstance) {
    return !defs[instance.defId].recurringDef
  })

  for (let defId in defs) {
    let def = defs[defId]

    if (def.recurringDef) {
      let ranges = expandRecurringRanges(def, framingRange, calendar)

      for (let range of ranges) {
        let instance = createEventInstance(defId, range)
        instances[instance.instanceId] = instance
      }
    }
  }

  return { defs, instances }
}

// retrieves events that have the same groupId as the instance specified by `instanceId`
export function getRelatedEvents(eventStore: EventStore, instanceId: string): EventStore {
  let dest = createEmptyEventStore()
  let eventInstance = eventStore.instances[instanceId]
  let eventDef = eventStore.defs[eventInstance.defId]

  if (eventDef && eventInstance) {
    let matchGroupId = eventDef.groupId

    for (let defId in eventStore.defs) {
      let def = eventStore.defs[defId]

      if (def === eventDef || matchGroupId && matchGroupId === def.groupId) {
        dest.defs[defId] = def
      }
    }

    for (let instanceId in eventStore.instances) {
      let instance = eventStore.instances[instanceId]

      if (
        instance === eventInstance ||
        matchGroupId && matchGroupId === eventStore.defs[instance.defId].groupId
      ) {
        dest.instances[instanceId] = instance
      }
    }
  }

  return dest
}

export function transformRawEvents(rawEvents, func) {
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

export function createEmptyEventStore(): EventStore {
  return { defs: {}, instances: {} }
}

export function mergeEventStores(store0: EventStore, store1: EventStore): EventStore {
  return {
    defs: assignTo({}, store0.defs, store1.defs),
    instances: assignTo({}, store0.instances, store1.instances)
  }
}

export function filterEventStoreDefs(eventStore: EventStore, filterFunc: (eventDef: EventDef) => boolean): EventStore {
  let defs = filterHash(eventStore.defs, filterFunc)
  let instances = filterHash(eventStore.instances, function(instance: EventInstance) {
    return defs[instance.defId] // still exists?
  })
  return { defs, instances }
}
