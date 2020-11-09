import { __assign } from 'tslib'
import { guid } from '../util/misc'
import { DateInput } from '../datelib/env'
import { startOfDay } from '../datelib/marker'
import { parseRecurring } from './recurring-event'
import { CalendarContext } from '../CalendarContext'
import { EventDef } from './event-def'
import { createEventInstance, EventInstance } from './event-instance'
import { EventSource } from './event-source'
import { RefinedOptionsFromRefiners, RawOptionsFromRefiners, identity, Identity, Dictionary, refineProps } from '../options'
import { EVENT_UI_REFINERS, createEventUi, EventUiInput, EventUiRefined } from '../component/event-ui'

export const EVENT_NON_DATE_REFINERS = {
  id: String,
  groupId: String,
  title: String,
  url: String,
}

export const EVENT_DATE_REFINERS = {
  start: identity as Identity<DateInput>,
  end: identity as Identity<DateInput>,
  date: identity as Identity<DateInput>,
  allDay: Boolean,
}

const EVENT_REFINERS = { // does NOT include EVENT_UI_REFINERS
  ...EVENT_NON_DATE_REFINERS,
  ...EVENT_DATE_REFINERS,
  extendedProps: identity as Identity<Dictionary>,
}

type BuiltInEventRefiners = typeof EVENT_REFINERS

export interface EventRefiners extends BuiltInEventRefiners {
  // for ambient
}

export type EventInput =
  EventUiInput &
  RawOptionsFromRefiners<Required<EventRefiners>> & // Required hack
  { [extendedProp: string]: any }

export type EventRefined =
  EventUiRefined &
  RefinedOptionsFromRefiners<Required<EventRefiners>> // Required hack

export interface EventTuple {
  def: EventDef
  instance: EventInstance | null
}

export type EventInputTransformer = (input: EventInput) => EventInput
export type EventDefMemberAdder = (refined: EventRefined) => Partial<EventDef>

export function parseEvent(
  raw: EventInput,
  eventSource: EventSource<any> | null,
  context: CalendarContext,
  allowOpenRange: boolean,
  refiners = buildEventRefiners(context),
): EventTuple | null {
  let { refined, extra } = refineEventDef(raw, context, refiners)

  let defaultAllDay = computeIsDefaultAllDay(eventSource, context)
  let recurringRes = parseRecurring(
    refined,
    defaultAllDay,
    context.dateEnv,
    context.pluginHooks.recurringTypes,
  )

  if (recurringRes) {
    let def = parseEventDef(
      refined,
      extra,
      eventSource ? eventSource.sourceId : '',
      recurringRes.allDay,
      Boolean(recurringRes.duration),
      context,
    )

    def.recurringDef = { // don't want all the props from recurringRes. TODO: more efficient way to do this
      typeId: recurringRes.typeId,
      typeData: recurringRes.typeData,
      duration: recurringRes.duration,
    }

    return { def, instance: null }
  }
  let singleRes = parseSingle(refined, defaultAllDay, context, allowOpenRange)

  if (singleRes) {
    let def = parseEventDef(refined, extra, eventSource ? eventSource.sourceId : '', singleRes.allDay, singleRes.hasEnd, context)
    let instance = createEventInstance(def.defId, singleRes.range, singleRes.forcedStartTzo, singleRes.forcedEndTzo)

    return { def, instance }
  }

  return null
}

export function refineEventDef(raw: EventInput, context: CalendarContext, refiners = buildEventRefiners(context)) {
  return refineProps(raw, refiners)
}

export function buildEventRefiners(context: CalendarContext) {
  return { ...EVENT_UI_REFINERS, ...EVENT_REFINERS, ...context.pluginHooks.eventRefiners }
}

/*
Will NOT populate extendedProps with the leftover properties.
Will NOT populate date-related props.
*/
export function parseEventDef(
  refined: EventRefined,
  extra: Dictionary,
  sourceId: string,
  allDay: boolean,
  hasEnd: boolean,
  context: CalendarContext,
): EventDef {
  let def: EventDef = {
    title: refined.title || '',
    groupId: refined.groupId || '',
    publicId: refined.id || '',
    url: refined.url || '',
    recurringDef: null,
    defId: guid(),
    sourceId,
    allDay,
    hasEnd,
    ui: createEventUi(refined, context),
    extendedProps: {
      ...(refined.extendedProps || {}),
      ...extra,
    },
  }

  for (let memberAdder of context.pluginHooks.eventDefMemberAdders) {
    __assign(def, memberAdder(refined))
  }

  // help out EventApi from having user modify props
  Object.freeze(def.ui.classNames)
  Object.freeze(def.extendedProps)

  return def
}

function parseSingle(refined: EventRefined, defaultAllDay: boolean | null, context: CalendarContext, allowOpenRange?: boolean) {
  let { allDay } = refined
  let startMeta
  let startMarker = null
  let hasEnd = false
  let endMeta
  let endMarker = null

  let startInput = refined.start != null ? refined.start : refined.date
  startMeta = context.dateEnv.createMarkerMeta(startInput)

  if (startMeta) {
    startMarker = startMeta.marker
  } else if (!allowOpenRange) {
    return null
  }

  if (refined.end != null) {
    endMeta = context.dateEnv.createMarkerMeta(refined.end)
  }

  if (allDay == null) {
    if (defaultAllDay != null) {
      allDay = defaultAllDay
    } else {
      // fall back to the date props LAST
      allDay = (!startMeta || startMeta.isTimeUnspecified) &&
        (!endMeta || endMeta.isTimeUnspecified)
    }
  }

  if (allDay && startMarker) {
    startMarker = startOfDay(startMarker)
  }

  if (endMeta) {
    endMarker = endMeta.marker

    if (allDay) {
      endMarker = startOfDay(endMarker)
    }

    if (startMarker && endMarker <= startMarker) {
      endMarker = null
    }
  }

  if (endMarker) {
    hasEnd = true
  } else if (!allowOpenRange) {
    hasEnd = context.options.forceEventDuration || false

    endMarker = context.dateEnv.add(
      startMarker,
      allDay ?
        context.options.defaultAllDayEventDuration :
        context.options.defaultTimedEventDuration,
    )
  }

  return {
    allDay,
    hasEnd,
    range: { start: startMarker, end: endMarker },
    forcedStartTzo: startMeta ? startMeta.forcedTzo : null,
    forcedEndTzo: endMeta ? endMeta.forcedTzo : null,
  }
}

function computeIsDefaultAllDay(eventSource: EventSource<any> | null, context: CalendarContext): boolean | null {
  let res = null

  if (eventSource) {
    res = eventSource.defaultAllDay
  }

  if (res == null) {
    res = context.options.defaultAllDay
  }

  return res
}
