import { EventSource, EventSourceHash, doesSourceNeedRange, parseEventSource } from '../structs/event-source'
import { Calendar } from '../Calendar'
import { arrayToHash, filterHash } from '../util/object'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import { Action } from './types'
import { guid } from '../util/misc'
import { PluginHooks } from '../plugin-system'

export function reduceEventSources(eventSources: EventSourceHash, action: Action, dateProfile: DateProfile | null, pluginHooks: PluginHooks, rawOptions, calendar: Calendar): EventSourceHash {
  let activeRange = dateProfile ? dateProfile.activeRange : null

  switch (action.type) {
    case 'INIT':
      return addSources(
        eventSources,
        parseInitialSources(action.optionOverrides, pluginHooks, calendar),
        activeRange,
        pluginHooks,
        rawOptions,
        calendar
      )

    case 'ADD_EVENT_SOURCES': // already parsed
      return addSources(eventSources, action.sources, activeRange, pluginHooks, rawOptions, calendar)

    case 'REMOVE_EVENT_SOURCE':
      return removeSource(eventSources, action.sourceId)

    case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
    case 'NEXT':
    case 'SET_DATE':
    case 'SET_VIEW_TYPE':
      if (dateProfile) {
        return fetchDirtySources(eventSources, activeRange, pluginHooks, rawOptions, calendar)
      } else {
        return eventSources
      }

    case 'FETCH_EVENT_SOURCES':
      return fetchSourcesByIds(
        eventSources,
        (action as any).sourceIds ? // why no type?
          arrayToHash((action as any).sourceIds) :
          excludeStaticSources(eventSources, pluginHooks),
        activeRange,
        pluginHooks,
        calendar
      )

    case 'SET_OPTION':
      if (action.optionName === 'timeZone') {
        return fetchSourcesByIds(
          eventSources,
          excludeStaticSources(eventSources, pluginHooks),
          activeRange,
          pluginHooks,
          calendar
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


function addSources(eventSourceHash: EventSourceHash, sources: EventSource[], fetchRange: DateRange | null, pluginHooks: PluginHooks, rawOptions, calendar: Calendar): EventSourceHash {
  let hash: EventSourceHash = {}

  for (let source of sources) {
    hash[source.sourceId] = source
  }

  if (fetchRange) {
    hash = fetchDirtySources(hash, fetchRange, pluginHooks, rawOptions, calendar)
  }

  return { ...eventSourceHash, ...hash }
}


function removeSource(eventSourceHash: EventSourceHash, sourceId: string): EventSourceHash {
  return filterHash(eventSourceHash, function(eventSource: EventSource) {
    return eventSource.sourceId !== sourceId
  })
}


function fetchDirtySources(sourceHash: EventSourceHash, fetchRange: DateRange, pluginHooks: PluginHooks, rawOptions, calendar: Calendar): EventSourceHash {
  return fetchSourcesByIds(
    sourceHash,
    filterHash(sourceHash, function(eventSource) {
      return isSourceDirty(eventSource, fetchRange, rawOptions, pluginHooks)
    }),
    fetchRange,
    pluginHooks,
    calendar
  )
}


function isSourceDirty(eventSource: EventSource, fetchRange: DateRange, rawOptions, pluginHooks: PluginHooks) {

  if (!doesSourceNeedRange(eventSource, pluginHooks)) {
    return !eventSource.latestFetchId
  } else {
    return !rawOptions.lazyFetching ||
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
  pluginHooks: PluginHooks,
  calendar: Calendar
): EventSourceHash {
  let nextSources: EventSourceHash = {}

  for (let sourceId in prevSources) {
    let source = prevSources[sourceId]

    if (sourceIdHash[sourceId]) {
      nextSources[sourceId] = fetchSource(source, fetchRange, pluginHooks, calendar)
    } else {
      nextSources[sourceId] = source
    }
  }

  return nextSources
}


function fetchSource(eventSource: EventSource, fetchRange: DateRange, pluginHooks: PluginHooks, calendar: Calendar) {
  let sourceDef = pluginHooks.eventSourceDefs[eventSource.sourceDefId]
  let fetchId = guid()

  sourceDef.fetch(
    {
      eventSource,
      calendar,
      range: fetchRange
    },
    function(res) {
      let { rawEvents } = res
      let sourceSuccessRes

      if (eventSource.success) {
        sourceSuccessRes = eventSource.success(rawEvents, res.xhr)
      }

      let calSuccessRes = calendar.publiclyTrigger('eventSourceSuccess', [ rawEvents, res.xhr ])
      rawEvents = sourceSuccessRes || calSuccessRes || rawEvents

      calendar.dispatch({
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

      calendar.publiclyTrigger('eventSourceFailure', [ error ])

      calendar.dispatch({
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


function excludeStaticSources(eventSources: EventSourceHash, pluginHooks: PluginHooks): EventSourceHash {
  return filterHash(eventSources, function(eventSource) {
    return doesSourceNeedRange(eventSource, pluginHooks)
  })
}


function parseInitialSources(rawOptions, pluginHooks, calendar: Calendar) {
  let rawSources = rawOptions.eventSources || []
  let singleRawSource = rawOptions.events
  let sources = [] // parsed

  if (singleRawSource) {
    rawSources.unshift(singleRawSource)
  }

  for (let rawSource of rawSources) {
    let source = parseEventSource(rawSource, pluginHooks, calendar)
    if (source) {
      sources.push(source)
    }
  }

  return sources
}
