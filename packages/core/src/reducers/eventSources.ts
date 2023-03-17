import { EventSource, EventSourceHash } from '../structs/event-source.js'
import { parseEventSource, buildEventSourceRefiners } from '../structs/event-source-parse.js'
import { arrayToHash, filterHash } from '../util/object.js'
import { DateRange } from '../datelib/date-range.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { Action } from './Action.js'
import { guid } from '../util/misc.js'
import { CalendarContext } from '../CalendarContext.js'
import { CalendarOptions } from '../options.js'

export function initEventSources(calendarOptions, dateProfile: DateProfile, context: CalendarContext) {
  let activeRange = dateProfile ? dateProfile.activeRange : null

  return addSources(
    {},
    parseInitialSources(calendarOptions, context),
    activeRange,
    context,
  )
}

export function reduceEventSources(
  eventSources: EventSourceHash,
  action: Action,
  dateProfile: DateProfile,
  context: CalendarContext,
): EventSourceHash {
  let activeRange = dateProfile ? dateProfile.activeRange : null // need this check?

  switch (action.type) {
    case 'ADD_EVENT_SOURCES': // already parsed
      return addSources(eventSources, action.sources, activeRange, context)

    case 'REMOVE_EVENT_SOURCE':
      return removeSource(eventSources, action.sourceId)

    case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
    case 'NEXT':
    case 'CHANGE_DATE':
    case 'CHANGE_VIEW_TYPE':
      if (dateProfile) {
        return fetchDirtySources(eventSources, activeRange, context)
      }
      return eventSources

    case 'FETCH_EVENT_SOURCES':
      return fetchSourcesByIds(
        eventSources,
        (action as any).sourceIds ? // why no type?
          arrayToHash((action as any).sourceIds) :
          excludeStaticSources(eventSources, context),
        activeRange,
        action.isRefetch || false,
        context,
      )

    case 'RECEIVE_EVENTS':
    case 'RECEIVE_EVENT_ERROR':
      return receiveResponse(eventSources, action.sourceId, action.fetchId, action.fetchRange)

    case 'REMOVE_ALL_EVENT_SOURCES':
      return {}

    default:
      return eventSources
  }
}

export function reduceEventSourcesNewTimeZone(eventSources: EventSourceHash, dateProfile: DateProfile, context: CalendarContext) {
  let activeRange = dateProfile ? dateProfile.activeRange : null // need this check?

  return fetchSourcesByIds(
    eventSources,
    excludeStaticSources(eventSources, context),
    activeRange,
    true,
    context,
  )
}

export function computeEventSourcesLoading(eventSources: EventSourceHash): boolean {
  for (let sourceId in eventSources) {
    if (eventSources[sourceId].isFetching) {
      return true
    }
  }

  return false
}

function addSources(
  eventSourceHash: EventSourceHash,
  sources: EventSource<any>[],
  fetchRange: DateRange | null,
  context: CalendarContext,
): EventSourceHash {
  let hash: EventSourceHash = {}

  for (let source of sources) {
    hash[source.sourceId] = source
  }

  if (fetchRange) {
    hash = fetchDirtySources(hash, fetchRange, context)
  }

  return { ...eventSourceHash, ...hash }
}

function removeSource(eventSourceHash: EventSourceHash, sourceId: string): EventSourceHash {
  return filterHash(eventSourceHash, (eventSource: EventSource<any>) => eventSource.sourceId !== sourceId)
}

function fetchDirtySources(sourceHash: EventSourceHash, fetchRange: DateRange, context: CalendarContext): EventSourceHash {
  return fetchSourcesByIds(
    sourceHash,
    filterHash(sourceHash, (eventSource) => isSourceDirty(eventSource, fetchRange, context)),
    fetchRange,
    false,
    context,
  )
}

function isSourceDirty(eventSource: EventSource<any>, fetchRange: DateRange, context: CalendarContext) {
  if (!doesSourceNeedRange(eventSource, context)) {
    return !eventSource.latestFetchId
  }
  return !context.options.lazyFetching ||
      !eventSource.fetchRange ||
      eventSource.isFetching || // always cancel outdated in-progress fetches
      fetchRange.start < eventSource.fetchRange.start ||
      fetchRange.end > eventSource.fetchRange.end
}

function fetchSourcesByIds(
  prevSources: EventSourceHash,
  sourceIdHash: { [sourceId: string]: any },
  fetchRange: DateRange,
  isRefetch: boolean,
  context: CalendarContext,
): EventSourceHash {
  let nextSources: EventSourceHash = {}

  for (let sourceId in prevSources) {
    let source = prevSources[sourceId]

    if (sourceIdHash[sourceId]) {
      nextSources[sourceId] = fetchSource(source, fetchRange, isRefetch, context)
    } else {
      nextSources[sourceId] = source
    }
  }

  return nextSources
}

function fetchSource(eventSource: EventSource<any>, fetchRange: DateRange, isRefetch: boolean, context: CalendarContext) {
  let { options, calendarApi } = context
  let sourceDef = context.pluginHooks.eventSourceDefs[eventSource.sourceDefId]
  let fetchId = guid()

  sourceDef.fetch(
    {
      eventSource,
      range: fetchRange,
      isRefetch,
      context,
    },
    (res) => {
      let { rawEvents } = res

      if (options.eventSourceSuccess) {
        rawEvents = options.eventSourceSuccess.call(calendarApi, rawEvents, res.response) || rawEvents
      }

      if (eventSource.success) {
        rawEvents = eventSource.success.call(calendarApi, rawEvents, res.response) || rawEvents
      }

      context.dispatch({
        type: 'RECEIVE_EVENTS',
        sourceId: eventSource.sourceId,
        fetchId,
        fetchRange,
        rawEvents,
      })
    },
    (error) => {
      let errorHandled = false

      if (options.eventSourceFailure) {
        options.eventSourceFailure.call(calendarApi, error)
        errorHandled = true
      }

      if (eventSource.failure) {
        eventSource.failure(error)
        errorHandled = true
      }

      if (!errorHandled) {
        console.warn(error.message, error)
      }

      context.dispatch({
        type: 'RECEIVE_EVENT_ERROR',
        sourceId: eventSource.sourceId,
        fetchId,
        fetchRange,
        error,
      })
    },
  )

  return {
    ...eventSource,
    isFetching: true,
    latestFetchId: fetchId,
  }
}

function receiveResponse(sourceHash: EventSourceHash, sourceId: string, fetchId: string, fetchRange: DateRange) {
  let eventSource: EventSource<any> = sourceHash[sourceId]

  if (
    eventSource && // not already removed
    fetchId === eventSource.latestFetchId
  ) {
    return {
      ...sourceHash,
      [sourceId]: {
        ...eventSource,
        isFetching: false,
        fetchRange, // also serves as a marker that at least one fetch has completed
      },
    }
  }

  return sourceHash
}

function excludeStaticSources(eventSources: EventSourceHash, context: CalendarContext): EventSourceHash {
  return filterHash(eventSources, (eventSource) => doesSourceNeedRange(eventSource, context))
}

function parseInitialSources(rawOptions: CalendarOptions, context: CalendarContext) {
  let refiners = buildEventSourceRefiners(context)
  let rawSources = [].concat(rawOptions.eventSources || [])
  let sources = [] // parsed

  if (rawOptions.initialEvents) {
    rawSources.unshift(rawOptions.initialEvents)
  }

  if (rawOptions.events) {
    rawSources.unshift(rawOptions.events)
  }

  for (let rawSource of rawSources) {
    let source = parseEventSource(rawSource, context, refiners)
    if (source) {
      sources.push(source)
    }
  }

  return sources
}

function doesSourceNeedRange(eventSource: EventSource<any>, context: CalendarContext) {
  let defs = context.pluginHooks.eventSourceDefs

  return !defs[eventSource.sourceDefId].ignoreRange
}
