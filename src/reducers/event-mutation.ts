import UnzonedRange from '../models/UnzonedRange'
import { DateEnv } from '../datelib/env'
import { diffDayAndTime } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import { EventStore, EventDef, EventInstance } from './event-store'
import { assignTo } from '../util/object'
import Calendar from '../Calendar'

export interface EventMutation {
  startDelta?: Duration
  endDelta?: Duration
  standardProps: object // for the def
  extendedProps: object // for the def
}

// Creating

export function createMutation(
  range0: UnzonedRange,
  isAllDay0: boolean,
  range1: UnzonedRange,
  isAllDay1: boolean,
  hasEnd: boolean,
  largeUnit: string,
  dateEnv: DateEnv
): EventMutation {
  let startDelta: Duration = null
  let endDelta: Duration = null
  let standardProps = {} as any

  // subtracts the dates in the appropriate way, returning a duration
  function diffDates(date0, date1) {
    if (largeUnit === 'year') {
      return createDuration(dateEnv.diffWholeYears(date0, date1), 'year')
    } else if (largeUnit === 'month') {
      return createDuration(dateEnv.diffWholeMonths(date0, date1), 'month')
    } else {
      return diffDayAndTime(date0, date1) // returns a duration
    }
  }

  startDelta = diffDates(range0.start, range1.start)
  endDelta = diffDates(range0.end, range1.end)

  if (isAllDay0 !== isAllDay1) {
    standardProps.isAllDay = isAllDay1

    if (hasEnd) {
      standardProps.hasEnd = false
    }
  }

  return {
    startDelta,
    endDelta,
    standardProps: standardProps,
    extendedProps: {}
  }
}

export function computeEventDisplacement(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let newStore = { defs: {}, instances: {} } // TODO: better name

  const dateEnv = calendar.dateEnv
  let eventInstance = eventStore.instances[instanceId]
  let eventDef = eventStore.defs[eventInstance.defId]

  if (eventDef && eventInstance) {
    let matchGroupId = eventDef.groupId

    for (let defId in eventStore.defs) {
      let def = eventStore.defs[defId]

      if (def === eventDef || matchGroupId && matchGroupId === def.groupId) {
        newStore.defs[defId] = applyMutationToDef(def, mutation)
      }
    }

    for (let instanceId in eventStore.instances) {
      let instance = eventStore.instances[instanceId]

      if (
        instance === eventInstance ||
        matchGroupId && matchGroupId === eventStore.defs[instance.defId].groupId
      ) {
        newStore.instances[instanceId] = applyMutationToInstance(instance, mutation, dateEnv)
      }
    }
  }

  return newStore
}

// Applying

export function applyMutation(eventStore: EventStore, instanceId: string, mutation: EventMutation, calendar: Calendar): EventStore {
  let displacement = computeEventDisplacement(eventStore, instanceId, mutation, calendar)

  return {
    defs: assignTo({}, eventStore.defs, displacement.defs),
    instances: assignTo({}, eventStore.instances, displacement.instances)
  }
}

function applyMutationToDef(eventDef: EventDef, mutation: EventMutation) {

  if (mutation.standardProps != null || mutation.extendedProps != null) {
    eventDef = assignTo({}, eventDef)

    if (mutation.standardProps != null) {
      assignTo(eventDef, mutation.standardProps)
    }

    if (mutation.extendedProps != null) {
      eventDef.extendedProps = assignTo({}, eventDef.extendedProps, mutation.extendedProps)
    }
  }

  return eventDef
}

function applyMutationToInstance(eventInstance: EventInstance, mutation: EventMutation, dateEnv: DateEnv) {

  if (mutation.startDelta || mutation.endDelta) {
    eventInstance = assignTo({}, eventInstance)

    if (mutation.startDelta) {
      eventInstance.range = new UnzonedRange(
        dateEnv.add(eventInstance.range.start, mutation.startDelta),
        eventInstance.range.end
      )
    }

    if (mutation.endDelta) {
      eventInstance.range = new UnzonedRange(
        eventInstance.range.start,
        dateEnv.add(eventInstance.range.end, mutation.endDelta),
      )
    }
  }

  return eventInstance
}
