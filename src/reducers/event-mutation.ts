import UnzonedRange from '../models/UnzonedRange'
import { diffDayAndTime, diffDays, startOfDay, addDays } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import { EventStore, EventDef, EventInstance } from './event-store'
import { assignTo } from '../util/object'
import Calendar from '../Calendar'

export interface EventMutation {
  startDelta?: Duration
  endDelta?: Duration
  standardProps?: any // for the def
  extendedProps?: any // for the def
}

export function applyMutationToRelated(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let relatedStore = getRelatedEvents(eventStore, instanceId)
  relatedStore = applyMutationToAll(relatedStore, mutation, calendar)
  return mergeStores(eventStore, relatedStore)
}

export function applyMutationToAll(eventStore: EventStore, mutation: EventMutation, calendar: Calendar): EventStore {
  let newStore = { defs: {}, instances: {} }

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]

    newStore.defs[defId] = applyMutationToDef(def, mutation)
  }

  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId]
    let def = newStore.defs[instance.defId] // the newly MODIFIED def

    newStore.instances[instanceId] = applyMutationToInstance(instance, def, mutation, calendar)
  }

  return newStore
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

function mergeStores(store0: EventStore, store1: EventStore): EventStore {
  return {
    defs: assignTo({}, store0.defs, store1.defs),
    instances: assignTo({}, store0.instances, store1.instances)
  }
}

function applyMutationToDef(eventDef: EventDef, mutation: EventMutation) {
  let copy = assignTo({}, eventDef)

  if (mutation.standardProps) {
    assignTo(copy, mutation.standardProps)
  }

  if (mutation.extendedProps) {
    copy.extendedProps = assignTo({}, copy.extendedProps, mutation.extendedProps)
  }

  return copy
}

function applyMutationToInstance(
  eventInstance: EventInstance,
  eventDef: EventDef, // after already having been modified
  mutation: EventMutation,
  calendar: Calendar
) {
  let dateEnv = calendar.dateEnv
  let forceAllDay = mutation.standardProps && mutation.standardProps.isAllDay === true
  let clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false
  let copy = assignTo({}, eventInstance)

  if (forceAllDay) {
    // TODO: make a util for this?
    let dayCnt = Math.floor(diffDays(copy.range.start, copy.range.end)) || 1
    let start = startOfDay(copy.range.start)
    let end = addDays(start, dayCnt)
    copy.range = new UnzonedRange(start, end)
  }

  if (mutation.startDelta) {
    copy.range = new UnzonedRange(
      dateEnv.add(copy.range.start, mutation.startDelta),
      copy.range.end
    )
  }

  if (clearEnd) {
    copy.range = new UnzonedRange(
      copy.range.start,
      calendar.getDefaultEventEnd(eventDef.isAllDay, copy.range.start)
    )
  } else if (mutation.endDelta) {
    copy.range = new UnzonedRange(
      copy.range.start,
      dateEnv.add(copy.range.end, mutation.endDelta),
    )
  }

  return copy
}

export function diffDates(date0, date1, dateEnv, largeUnit) {
  if (largeUnit === 'year') {
    return createDuration(dateEnv.diffWholeYears(date0, date1), 'year')
  } else if (largeUnit === 'month') {
    return createDuration(dateEnv.diffWholeMonths(date0, date1), 'month')
  } else {
    return diffDayAndTime(date0, date1) // returns a duration
  }
}
