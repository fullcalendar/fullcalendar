import { EventInput, EventInputTransformer } from './event-parse'
import { EventSourceFunc } from '../event-sources/func-event-source'
import { EventSource, EventSourceSuccessResponseHandler, EventSourceErrorResponseHandler } from './event-source'
import { JSON_FEED_EVENT_SOURCE_REFINERS } from '../event-sources/json-feed-event-source-refiners'
import { CalendarContext } from '../CalendarContext'
import { guid } from '../util/misc'
import { EVENT_UI_REFINERS, createEventUi, EventUiInput, EventUiRefined } from '../component/event-ui'
import { identity, Identity, RawOptionsFromRefiners, refineProps, RefinedOptionsFromRefiners } from '../options'

const EVENT_SOURCE_REFINERS = { // does NOT include EVENT_UI_REFINERS
  id: String,
  defaultAllDay: Boolean,
  url: String,
  format: String,
  events: identity as Identity<EventInput[] | EventSourceFunc>, // array or function
  eventDataTransform: identity as Identity<EventInputTransformer>,

  // for any network-related sources
  success: identity as Identity<EventSourceSuccessResponseHandler>,
  failure: identity as Identity<EventSourceErrorResponseHandler>,
}

type BuiltInEventSourceRefiners = typeof EVENT_SOURCE_REFINERS &
  typeof JSON_FEED_EVENT_SOURCE_REFINERS

export interface EventSourceRefiners extends BuiltInEventSourceRefiners {
  // for extending
}

export type EventSourceInputObject =
  EventUiInput &
  RawOptionsFromRefiners<Required<EventSourceRefiners>> // Required hack

export type EventSourceInput =
  EventSourceInputObject | // object in extended form
  EventInput[] |
  EventSourceFunc | // just a function
  string // a URL for a JSON feed

export type EventSourceRefined =
  EventUiRefined &
  RefinedOptionsFromRefiners<Required<EventSourceRefiners>> // Required hack

export function parseEventSource(
  raw: EventSourceInput,
  context: CalendarContext,
  refiners = buildEventSourceRefiners(context),
): EventSource<any> | null {
  let rawObj: EventSourceInputObject

  if (typeof raw === 'string') {
    rawObj = { url: raw }
  } else if (typeof raw === 'function' || Array.isArray(raw)) {
    rawObj = { events: raw }
  } else if (typeof raw === 'object' && raw) { // not null
    rawObj = raw
  }

  if (rawObj) {
    let { refined, extra } = refineProps(rawObj, refiners)
    let metaRes = buildEventSourceMeta(refined, context)

    if (metaRes) {
      return {
        _raw: raw,
        isFetching: false,
        latestFetchId: '',
        fetchRange: null,
        defaultAllDay: refined.defaultAllDay,
        eventDataTransform: refined.eventDataTransform,
        success: refined.success,
        failure: refined.failure,
        publicId: refined.id || '',
        sourceId: guid(),
        sourceDefId: metaRes.sourceDefId,
        meta: metaRes.meta,
        ui: createEventUi(refined, context),
        extendedProps: extra,
      }
    }
  }

  return null
}

export function buildEventSourceRefiners(context: CalendarContext) {
  return { ...EVENT_UI_REFINERS, ...EVENT_SOURCE_REFINERS, ...context.pluginHooks.eventSourceRefiners }
}

function buildEventSourceMeta(raw: EventSourceRefined, context: CalendarContext) {
  let defs = context.pluginHooks.eventSourceDefs

  for (let i = defs.length - 1; i >= 0; i -= 1) { // later-added plugins take precedence
    let def = defs[i]
    let meta = def.parseMeta(raw)

    if (meta) {
      return { sourceDefId: i, meta }
    }
  }

  return null
}
