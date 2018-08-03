import { Duration } from '../datelib/duration'
import { EventStore, createEmptyEventStore } from './event-store'
import { EventDef, EventInstance } from './event'
import { assignTo } from '../util/object'
import Calendar from '../Calendar'
import { computeAlignedDayRange } from '../util/misc'

/*
A data structure for how to modify an EventDef/EventInstance within an EventStore
*/

export interface EventMutation {
  startDelta?: Duration
  endDelta?: Duration
  standardProps?: any // for the def. should not include extendedProps
  extendedProps?: any // for the def
}

// applies the mutation to ALL defs/instances within the event store
export function applyMutationToEventStore(eventStore: EventStore, mutation: EventMutation, calendar: Calendar): EventStore {
  let dest = createEmptyEventStore()

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]
    dest.defs[defId] = applyMutationToEventDef(def, mutation)
  }

  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId]
    let def = dest.defs[instance.defId] // important to grab the newly modified def
    dest.instances[instanceId] = applyMutationToEventInstance(instance, def, mutation, calendar)
  }

  return dest
}

function applyMutationToEventDef(eventDef: EventDef, mutation: EventMutation): EventDef {
  let copy = assignTo({}, eventDef)

  if (mutation.standardProps) {
    assignTo(copy, mutation.standardProps)
  }

  if (mutation.extendedProps) {
    copy.extendedProps = assignTo({}, copy.extendedProps, mutation.extendedProps)
  }

  return copy
}

function applyMutationToEventInstance(
  eventInstance: EventInstance,
  eventDef: EventDef, // must first be modified by applyMutationToEventDef
  mutation: EventMutation,
  calendar: Calendar
): EventInstance {
  let dateEnv = calendar.dateEnv
  let forceAllDay = mutation.standardProps && mutation.standardProps.isAllDay === true
  let clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false
  let copy = assignTo({}, eventInstance) as EventInstance

  if (forceAllDay) {
    copy.range = computeAlignedDayRange(copy.range)
  }

  if (mutation.startDelta) {
    copy.range = {
      start: dateEnv.add(copy.range.start, mutation.startDelta),
      end: copy.range.end
    }
  }

  if (clearEnd) {
    copy.range = {
      start: copy.range.start,
      end: calendar.getDefaultEventEnd(eventDef.isAllDay, copy.range.start)
    }
  } else if (mutation.endDelta) {
    copy.range = {
      start: copy.range.start,
      end: dateEnv.add(copy.range.end, mutation.endDelta),
    }
  }

  return copy
}
