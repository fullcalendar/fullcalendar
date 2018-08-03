import UnzonedRange from '../models/UnzonedRange'
import { EventInput, EventDefHash, EventInstanceHash, parseEventDef, parseEventDateSpan, createEventInstance } from './event'
import { expandRecurring } from './recurring-event'
import Calendar from '../Calendar'
import { assignTo } from '../util/object'

/*
A data structure that encapsulates EventDefs and EventInstances.
Utils for parsing this data from raw EventInputs.
Utils for manipulating an EventStore.
*/

export interface EventStore {
  defs: EventDefHash
  instances: EventInstanceHash
}

export function parseEventStore(
  rawEvents: EventInput[],
  sourceId: string,
  fetchRange: UnzonedRange,
  calendar: Calendar,
  dest: EventStore = createEmptyEventStore() // specify this arg to append to an existing EventStore
): EventStore {

  for (let rawEvent of rawEvents) {
    let leftovers = {}
    let recurringDateSpans = expandRecurring(rawEvent, fetchRange, calendar, leftovers)

    // a recurring event?
    if (recurringDateSpans) {
      let def = parseEventDef(leftovers, sourceId, recurringDateSpans.isAllDay, recurringDateSpans.hasEnd)
      dest.defs[def.defId] = def

      for (let range of recurringDateSpans.ranges) {
        let instance = createEventInstance(def.defId, range)
        dest.instances[instance.instanceId] = instance
      }

    // a non-recurring event
    } else {
      let dateSpan = parseEventDateSpan(rawEvent, sourceId, calendar, leftovers)

      if (dateSpan) {
        let def = parseEventDef(leftovers, sourceId, dateSpan.isAllDay, dateSpan.hasEnd)
        let instance = createEventInstance(def.defId, dateSpan.range, dateSpan.forcedStartTzo, dateSpan.forcedEndTzo)

        dest.defs[def.defId] = def
        dest.instances[instance.instanceId] = instance
      }
    }
  }

  return dest
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

export function createEmptyEventStore(): EventStore {
  return { defs: {}, instances: {} }
}

export function mergeEventStores(store0: EventStore, store1: EventStore): EventStore {
  return {
    defs: assignTo({}, store0.defs, store1.defs),
    instances: assignTo({}, store0.instances, store1.instances)
  }
}
