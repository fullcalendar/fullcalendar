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
import { EventSource } from './event-source'
import { expandRecurringRanges } from './recurring-event'
import Calendar from '../Calendar'
import { filterHash } from '../util/object'
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
  calendar: Calendar,
  allowOpenRange?: boolean
): EventStore {
  let eventStore = createEmptyEventStore()

  for (let rawEvent of rawEvents) {
    let tuple = parseEvent(rawEvent, sourceId, calendar, allowOpenRange)

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
  let dateEnv = calendar.dateEnv
  let { defs, instances } = eventStore

  // remove existing recurring instances
  instances = filterHash(instances, function(instance: EventInstance) {
    return !defs[instance.defId].recurringDef
  })

  for (let defId in defs) {
    let def = defs[defId]

    if (def.recurringDef) {
      let duration = def.recurringDef.duration

      if (!duration) {
        duration = def.allDay ?
          calendar.defaultAllDayEventDuration :
          calendar.defaultTimedEventDuration
      }

      let starts = expandRecurringRanges(def, duration, framingRange, calendar.dateEnv, calendar.pluginSystem.hooks.recurringTypes)

      for (let start of starts) {
        let instance = createEventInstance(defId, {
          start,
          end: dateEnv.add(start, duration)
        })
        instances[instance.instanceId] = instance
      }
    }
  }

  return { defs, instances }
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

export function transformRawEvents(rawEvents, eventSource: EventSource, calendar: Calendar) {
  let calEachTransform = calendar.opt('eventDataTransform')
  let sourceEachTransform = eventSource ? eventSource.eventDataTransform : null

  if (sourceEachTransform) {
    rawEvents = transformEachRawEvent(rawEvents, sourceEachTransform)
  }

  if (calEachTransform) {
    rawEvents = transformEachRawEvent(rawEvents, calEachTransform)
  }

  return rawEvents
}

function transformEachRawEvent(rawEvents, func) {
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
