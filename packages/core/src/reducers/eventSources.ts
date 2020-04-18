import { EventSource, EventSourceHash, doesSourceNeedRange, parseEventSource } from '../structs/event-source'
import { arrayToHash, filterHash } from '../util/object'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import { Action } from './types'
import { guid } from '../util/misc'
import { ReducerContext } from './ReducerContext'


export function reduceEventSources(eventSources: EventSourceHash, action: Action, dateProfile: DateProfile | null, context: ReducerContext): EventSourceHash {
  let activeRange = dateProfile ? dateProfile.activeRange : null

  switch (action.type) {
    case 'INIT':
      return addSources(
        eventSources,
        parseInitialSources(action.optionOverrides, context),
        activeRange,
        context
      )

    case 'ADD_EVENT_SOURCES': // already parsed
      return addSources(eventSources, action.sources, activeRange, context)

    case 'REMOVE_EVENT_SOURCE':
      return removeSource(eventSources, action.sourceId)

    case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
    case 'NEXT':
    case 'SET_DATE':
    case 'SET_VIEW_TYPE':
      if (dateProfile) {
        return fetchDirtySources(eventSources, activeRange, context)
      } else {
        return eventSources
      }

    case 'FETCH_EVENT_SOURCES':
      return fetchSourcesByIds(
        eventSources,
        (action as any).sourceIds ? // why no type?
          arrayToHash((action as any).sourceIds) :
          excludeStaticSources(eventSources, context),
        activeRange,
        context
      )

    case 'SET_OPTION':
      if (action.optionName === 'timeZone') {
        return fetchSourcesByIds(
          eventSources,
          excludeStaticSources(eventSources, context),
          activeRange,
          context
        )
      } else {
        return eventSources
      }

    case 'RECEIVE_EVENTS':
    case 'RECEIVE_EVENT_ERROR':
      return receiveResponse(eventSources, action.sourceId, action.fetchId, action.fetchRange)

    case 'REMOVE_ALL_EVENT_SOURCES':
      return {}

    default:
      return eventSources
  }
}


function addSources(eventSourceHash: EventSourceHash, sources: EventSource[], fetchRange: DateRange | null, context: ReducerContext): EventSourceHash {
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
  return filterHash(eventSourceHash, function(eventSource: EventSource) {
    return eventSource.sourceId !== sourceId
  })
}


function fetchDirtySources(sourceHash: EventSourceHash, fetchRange: DateRange, context: ReducerContext): EventSourceHash {
  return fetchSourcesByIds(
    sourceHash,
    filterHash(sourceHash, function(eventSource) {
      return isSourceDirty(eventSource, fetchRange, context)
    }),
    fetchRange,
    context
  )
}


function isSourceDirty(eventSource: EventSource, fetchRange: DateRange, context: ReducerContext) {

  if (!doesSourceNeedRange(eventSource, context)) {
    return !eventSource.latestFetchId

  } else {
    return !context.options.lazyFetching ||
      !eventSource.fetchRange ||
      eventSource.isFetching || // always cancel outdated in-progress fetches
      fetchRange.start < eventSource.fetchRange.start ||
      fetchRange.end > eventSource.fetchRange.end
  }
}


function fetchSourcesByIds(
  prevSources: EventSourceHash,
  sourceIdHash: { [sourceId: string]: any },
  fetchRange: DateRange,
  context: ReducerContext
): EventSourceHash {
  let nextSources: EventSourceHash = {}

  for (let sourceId in prevSources) {
    let source = prevSources[sourceId]

    if (sourceIdHash[sourceId]) {
      nextSources[sourceId] = fetchSource(source, fetchRange, context)
    } else {
      nextSources[sourceId] = source
    }
  }

  return nextSources
}


function fetchSource(eventSource: EventSource, fetchRange: DateRange, context: ReducerContext) {
  let sourceDef = context.pluginHooks.eventSourceDefs[eventSource.sourceDefId]
  let fetchId = guid()

  sourceDef.fetch(
    {
      eventSource,
      range: fetchRange,
      context
    },
    function(res) {
      let { rawEvents } = res
      let sourceSuccessRes

      if (eventSource.success) {
        sourceSuccessRes = eventSource.success(rawEvents, res.xhr)
      }

      let calSuccessRes = context.emitter.trigger('eventSourceSuccess', rawEvents, res.xhr)
      rawEvents = sourceSuccessRes || calSuccessRes || rawEvents

      context.dispatch({
        type: 'RECEIVE_EVENTS',
        sourceId: eventSource.sourceId,
        fetchId,
        fetchRange,
        rawEvents
      })
    },
    function(error) {
      console.warn(error.message, error)

      if (eventSource.failure) {
        eventSource.failure(error)
      }

      context.emitter.trigger('eventSourceFailure', error)

      context.dispatch({
        type: 'RECEIVE_EVENT_ERROR',
        sourceId: eventSource.sourceId,
        fetchId,
        fetchRange,
        error
      })
    }
  )

  return {
    ...eventSource,
    isFetching: true,
    latestFetchId: fetchId
  }
}


function receiveResponse(sourceHash: EventSourceHash, sourceId: string, fetchId: string, fetchRange: DateRange) {
  let eventSource: EventSource = sourceHash[sourceId]

  if (
    eventSource && // not already removed
    fetchId === eventSource.latestFetchId
  ) {
    return {
      ...sourceHash,
      [sourceId]: {
        ...eventSource,
        isFetching: false,
        fetchRange // also serves as a marker that at least one fetch has completed
      }
    }
  }

  return sourceHash
}


function excludeStaticSources(eventSources: EventSourceHash, context: ReducerContext): EventSourceHash {
  return filterHash(eventSources, function(eventSource) {
    return doesSourceNeedRange(eventSource, context)
  })
}


function parseInitialSources(rawOptions, context: ReducerContext) {
  let rawSources = rawOptions.eventSources || []
  let singleRawSource = rawOptions.events
  let sources = [] // parsed

  if (singleRawSource) {
    rawSources.unshift(singleRawSource)
  }

  for (let rawSource of rawSources) {
    let source = parseEventSource(rawSource, context)
    if (source) {
      sources.push(source)
    }
  }

  return sources
}
