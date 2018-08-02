import UnzonedRange from '../models/UnzonedRange'
import { EventInput, EventDefHash, EventInstanceHash, parseEventDef, parseEventDateSpan, createEventInstance } from './event'
import { expandRecurring } from './recurring-event'
import Calendar from '../Calendar'
import { assignTo } from '../util/object'

export interface EventStore {
  defs: EventDefHash
  instances: EventInstanceHash
}

export function addRawEvents(eventStore: EventStore, sourceId: string, fetchRange: UnzonedRange, rawEvents: any, calendar: Calendar) {
  rawEvents.forEach(function(rawEvent: EventInput) {
    let leftoverProps = {}
    let recurringDateInfo = expandRecurring(rawEvent, fetchRange, calendar, leftoverProps)

    if (recurringDateInfo) {
      let def = parseEventDef(leftoverProps, sourceId, recurringDateInfo.isAllDay, recurringDateInfo.hasEnd)
      eventStore.defs[def.defId] = def

      for (let range of recurringDateInfo.ranges) {
        let instance = createEventInstance(def.defId, range)
        eventStore.instances[instance.instanceId] = instance
      }

    } else {
      let dateInfo = parseEventDateSpan(rawEvent, sourceId, calendar, leftoverProps)

      if (dateInfo) {
        let def = parseEventDef(leftoverProps, sourceId, dateInfo.isAllDay, dateInfo.hasEnd)
        let instance = createEventInstance(def.defId, dateInfo.range, dateInfo.forcedStartTzo, dateInfo.forcedEndTzo)

        eventStore.defs[def.defId] = def
        eventStore.instances[instance.instanceId] = instance
      }
    }
  })
}

export function createEmptyEventStore(): EventStore {
  return { defs: {}, instances: {} }
}

export function mergeStores(store0: EventStore, store1: EventStore): EventStore {
  return {
    defs: assignTo({}, store0.defs, store1.defs),
    instances: assignTo({}, store0.instances, store1.instances)
  }
}

export function getRelatedEvents(eventStore: EventStore, instanceId: string): EventStore {
  let newStore = { defs: {}, instances: {} } // TODO: better name
  let eventInstance = eventStore.instances[instanceId]
  let eventDef = eventStore.defs[eventInstance.defId]

  if (eventDef && eventInstance) {
    let matchGroupId = eventDef.groupId

    for (let defId in eventStore.defs) {
      let def = eventStore.defs[defId]

      if (def === eventDef || matchGroupId && matchGroupId === def.groupId) {
        newStore.defs[defId] = def
      }
    }

    for (let instanceId in eventStore.instances) {
      let instance = eventStore.instances[instanceId]

      if (
        instance === eventInstance ||
        matchGroupId && matchGroupId === eventStore.defs[instance.defId].groupId
      ) {
        newStore.instances[instanceId] = instance
      }
    }
  }

  return newStore
}
