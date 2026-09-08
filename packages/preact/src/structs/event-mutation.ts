import { Duration, startOfDay } from '@full-ui/headless-calendar'
import { EventStore, createEmptyEventStore } from './event-store'
import { EventDef } from './event-def'
import {
  buildEventInstanceRange, buildValidInstanceRange,
  EventInstance, EventInstanceRange, EventRangeEdge, resolveEdgeInstantMs,
} from './event-instance'
import { computeAlignedDayRange } from '../util/date'
import { EventUiHash, EventUi } from '../component-util/event-ui'
import { compileEventUis } from '../component-util/event-rendering'
import { CalendarContext } from '../CalendarContext'
import { getDefaultEventEndEdge } from '../calendar-utils'

/*
A data structure for how to modify an EventDef/EventInstance within an EventStore
*/

export interface EventMutation {
  datesDelta?: Duration // body start+end moving together. for dragging
  startDelta?: Duration // for resizing
  endDelta?: Duration // for resizing
  // When hits carry exact instants (instant-aware views like timed timeline), the delta is also
  // expressed in absolute ms so DST gaps/folds don't get reinterpreted through civil-marker
  // arithmetic. Takes precedence over the corresponding Duration when present.
  instantDatesDeltaMs?: number
  instantStartDeltaMs?: number
  instantEndDeltaMs?: number
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
  let forceAllDay = mutation.standardProps && mutation.standardProps.allDay === true
  let clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false
  let copy = { ...eventInstance } as EventInstance

  if (forceAllDay) {
    copy.range = computeAlignedDayRange(copy.range) // fresh plain range: instants stripped
  }

  if (mutation.datesDelta && eventConfig.startEditable) {
    copy.range = buildInstanceRange(
      addDeltaToRangeEdge(copy.range.start, copy.range.instantStartMs, mutation.datesDelta, mutation.instantDatesDeltaMs, context),
      addDeltaToRangeEdge(copy.range.end, copy.range.instantEndMs, mutation.datesDelta, mutation.instantDatesDeltaMs, context),
    )
  }

  if (mutation.startDelta && eventConfig.durationEditable) {
    copy.range = buildInstanceRange(
      addDeltaToRangeEdge(copy.range.start, copy.range.instantStartMs, mutation.startDelta, mutation.instantStartDeltaMs, context),
      { marker: copy.range.end, instantMs: copy.range.instantEndMs },
    )
  }

  if (mutation.endDelta && eventConfig.durationEditable) {
    copy.range = buildInstanceRange(
      { marker: copy.range.start, instantMs: copy.range.instantStartMs },
      addDeltaToRangeEdge(copy.range.end, copy.range.instantEndMs, mutation.endDelta, mutation.instantEndDeltaMs, context),
    )
  }

  if (clearEnd) {
    const startEdge: EventRangeEdge = { marker: copy.range.start, instantMs: copy.range.instantStartMs }
    copy.range = buildInstanceRange(startEdge, getDefaultEventEndEdge(eventDef.allDay, startEdge, context))
  }

  // in case event was all-day but the supplied deltas were not
  // better util for this?
  if (eventDef.allDay) {
    copy.range = {
      start: startOfDay(copy.range.start),
      end: startOfDay(copy.range.end),
    }
  }

  // handle invalid durations. a timed range can be invalid civilly or in real time.
  // a real range that a DST fall-back fold civilly compresses is re-expressed (end in the
  // start's offset reading) rather than repaired away
  if (eventDef.allDay) {
    if (copy.range.end <= copy.range.start) {
      const startEdge: EventRangeEdge = { marker: copy.range.start }
      copy.range = buildInstanceRange(startEdge, getDefaultEventEndEdge(true, startEdge, context))
    }
  } else {
    const startEdge: EventRangeEdge = { marker: copy.range.start, instantMs: copy.range.instantStartMs }
    copy.range = buildValidInstanceRange(
      startEdge,
      { marker: copy.range.end, instantMs: copy.range.instantEndMs },
      context.dateEnv,
    ) ?? buildInstanceRange(startEdge, getDefaultEventEndEdge(false, startEdge, context))
  }

  return copy
}

/*
When instantDeltaMs is given, moves the edge by an exact instant amount, basing off the
edge's stored instant when present (preserves identity through DST fall-back doubled times).
The resulting marker is always a real local time in the current timeZone; ambiguous civil
times resolve deterministically. Civil (Duration-only) deltas invalidate any stored instant.
*/
export function addDeltaToRangeEdge(
  marker: Date,
  instantMs: number | undefined,
  delta: Duration,
  instantDeltaMs: number | undefined,
  context: CalendarContext,
): EventRangeEdge {
  if (instantDeltaMs != null) {
    const newInstantMs = resolveEdgeInstantMs(marker, instantMs, context.dateEnv) + instantDeltaMs
    return {
      marker: context.dateEnv.timestampToMarker(newInstantMs),
      instantMs: newInstantMs,
    }
  }

  // civil deltas apply to the edge's canonical civil form — a fold-compressed end's
  // stored marker is representational and must not enter civil arithmetic
  return {
    marker: context.dateEnv.add(
      instantMs != null ? context.dateEnv.timestampToMarker(instantMs) : marker,
      delta,
    ),
  }
}

function buildInstanceRange(start: EventRangeEdge, end: EventRangeEdge): EventInstanceRange {
  return buildEventInstanceRange(start.marker, end.marker, start.instantMs, end.instantMs)
}
