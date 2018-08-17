import {
  EventInput,
  EventDef,
  EventDefHash,
  EventInstance,
  EventInstanceHash,
  parseEventDef,
  parseEventDateSpan,
  createEventInstance
} from './event'
import { parseEventDefRecurring, expandEventDef } from './recurring-event'
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

export function parseEventStore(
  rawEvents: EventInput[],
  sourceId: string,
  calendar: Calendar,
  expandRange?: DateRange,
  dest: EventStore = createEmptyEventStore(), // specify this arg to append to an existing EventStore
): EventStore {

  for (let rawEvent of rawEvents) {
    let leftovers = {}
    let parsedRecurring = parseEventDefRecurring(rawEvent, leftovers)

    // a recurring event?
    if (parsedRecurring) {
      let def = parseEventDef(leftovers, sourceId, parsedRecurring.isAllDay, parsedRecurring.hasEnd)

      def.recurringDef = {
        typeId: parsedRecurring.typeId,
        typeData: parsedRecurring.typeData
      }

      dest.defs[def.defId] = def

      if (expandRange) {
        expandEventDefInstances(def, expandRange, calendar, dest.instances)
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

export function expandEventStoreInstances(
  eventStore: EventStore,
  framingRange: DateRange,
  calendar: Calendar
): EventInstanceHash {
  let dest: EventInstanceHash = {}

  for (let defId in eventStore.defs) {
    expandEventDefInstances(eventStore.defs[defId], framingRange, calendar, dest)
  }

  return dest
}

// TODO: be smarter about where this and expandEventStoreInstances are called
export function expandEventDefInstances(
  def: EventDef,
  framingRange: DateRange,
  calendar: Calendar,
  dest: EventInstanceHash
) {
  if (def.recurringDef) { // need to have this check?
    let ranges = expandEventDef(def, framingRange, calendar)

    for (let range of ranges) {
      let instance = createEventInstance(def.defId, range)

      dest[instance.instanceId] = instance
    }
  }
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

export function filterEventStoreDefs(eventStore: EventStore, filterFunc: (eventDef: EventDef) => boolean): EventStore {
  let defs = filterHash(eventStore.defs, filterFunc)
  let instances = filterHash(eventStore.instances, function(instance: EventInstance) {
    return defs[instance.defId] // still exists?
  })
  return { defs, instances }
}
