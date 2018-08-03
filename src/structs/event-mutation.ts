import UnzonedRange from '../models/UnzonedRange'
import { Duration } from '../datelib/duration'
import { EventStore, createEmptyEventStore } from './event-store'
import { EventDef, EventInstance } from './event'
import { assignTo } from '../util/object'
import Calendar from '../Calendar'
import { computeAlignedDayRange } from '../util/misc'

/*
*/

export interface EventMutation {
  startDelta?: Duration
  endDelta?: Duration
  standardProps?: any // for the def
  extendedProps?: any // for the def
}

// applies to ALL defs/instances within the event store
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
  let copy = assignTo({}, eventInstance)

  if (forceAllDay) {
    copy.range = computeAlignedDayRange(copy.range)
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
