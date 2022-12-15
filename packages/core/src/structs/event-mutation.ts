import { Duration } from '../datelib/duration.js'
import { EventStore, createEmptyEventStore } from './event-store.js'
import { EventDef } from './event-def.js'
import { EventInstance } from './event-instance.js'
import { computeAlignedDayRange } from '../util/date.js'
import { startOfDay } from '../datelib/marker.js'
import { EventUiHash, EventUi } from '../component/event-ui.js'
import { compileEventUis } from '../component/event-rendering.js'
import { CalendarContext } from '../CalendarContext.js'
import { getDefaultEventEnd } from '../calendar-utils.js'

/*
A data structure for how to modify an EventDef/EventInstance within an EventStore
*/

export interface EventMutation {
  datesDelta?: Duration // body start+end moving together. for dragging
  startDelta?: Duration // for resizing
  endDelta?: Duration // for resizing
  standardProps?: any // for the def. should not include extendedProps
  extendedProps?: any // for the def
}

// applies the mutation to ALL defs/instances within the event store
export function applyMutationToEventStore(
  eventStore: EventStore,
  eventConfigBase: EventUiHash,
  mutation: EventMutation,
  context: CalendarContext,
): EventStore {
  let eventConfigs = compileEventUis(eventStore.defs, eventConfigBase)
  let dest = createEmptyEventStore()

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]

    dest.defs[defId] = applyMutationToEventDef(def, eventConfigs[defId], mutation, context)
  }

  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId]
    let def = dest.defs[instance.defId] // important to grab the newly modified def

    dest.instances[instanceId] = applyMutationToEventInstance(instance, def, eventConfigs[instance.defId], mutation, context)
  }

  return dest
}

export type eventDefMutationApplier = (eventDef: EventDef, mutation: EventMutation, context: CalendarContext) => void

function applyMutationToEventDef(eventDef: EventDef, eventConfig: EventUi, mutation: EventMutation, context: CalendarContext): EventDef {
  let standardProps = mutation.standardProps || {}

  // if hasEnd has not been specified, guess a good value based on deltas.
  // if duration will change, there's no way the default duration will persist,
  // and thus, we need to mark the event as having a real end
  if (
    standardProps.hasEnd == null &&
    eventConfig.durationEditable &&
    (mutation.startDelta || mutation.endDelta)
  ) {
    standardProps.hasEnd = true // TODO: is this mutation okay?
  }

  let copy: EventDef = {
    ...eventDef,
    ...standardProps,
    ui: { ...eventDef.ui, ...standardProps.ui }, // the only prop we want to recursively overlay
  }

  if (mutation.extendedProps) {
    copy.extendedProps = { ...copy.extendedProps, ...mutation.extendedProps }
  }

  for (let applier of context.pluginHooks.eventDefMutationAppliers) {
    applier(copy, mutation, context)
  }

  if (!copy.hasEnd && context.options.forceEventDuration) {
    copy.hasEnd = true
  }

  return copy
}

function applyMutationToEventInstance(
  eventInstance: EventInstance,
  eventDef: EventDef, // must first be modified by applyMutationToEventDef
  eventConfig: EventUi,
  mutation: EventMutation,
  context: CalendarContext,
): EventInstance {
  let { dateEnv } = context
  let forceAllDay = mutation.standardProps && mutation.standardProps.allDay === true
  let clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false
  let copy = { ...eventInstance } as EventInstance

  if (forceAllDay) {
    copy.range = computeAlignedDayRange(copy.range)
  }

  if (mutation.datesDelta && eventConfig.startEditable) {
    copy.range = {
      start: dateEnv.add(copy.range.start, mutation.datesDelta),
      end: dateEnv.add(copy.range.end, mutation.datesDelta),
    }
  }

  if (mutation.startDelta && eventConfig.durationEditable) {
    copy.range = {
      start: dateEnv.add(copy.range.start, mutation.startDelta),
      end: copy.range.end,
    }
  }

  if (mutation.endDelta && eventConfig.durationEditable) {
    copy.range = {
      start: copy.range.start,
      end: dateEnv.add(copy.range.end, mutation.endDelta),
    }
  }

  if (clearEnd) {
    copy.range = {
      start: copy.range.start,
      end: getDefaultEventEnd(eventDef.allDay, copy.range.start, context),
    }
  }

  // in case event was all-day but the supplied deltas were not
  // better util for this?
  if (eventDef.allDay) {
    copy.range = {
      start: startOfDay(copy.range.start),
      end: startOfDay(copy.range.end),
    }
  }

  // handle invalid durations
  if (copy.range.end < copy.range.start) {
    copy.range.end = getDefaultEventEnd(eventDef.allDay, copy.range.start, context)
  }

  return copy
}
