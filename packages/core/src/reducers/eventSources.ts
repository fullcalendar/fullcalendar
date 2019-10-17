import { EventSource, EventSourceHash, doesSourceNeedRange } from '../structs/event-source'
import Calendar from '../Calendar'
import { arrayToHash, filterHash } from '../util/object'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import { Action } from './types'

export default function(eventSources: EventSourceHash, action: Action, dateProfile: DateProfile | null, calendar: Calendar): EventSourceHash {
  switch (action.type) {

    case 'ADD_EVENT_SOURCES': // already parsed
      return addSources(eventSources, action.sources, dateProfile ? dateProfile.activeRange : null, calendar)

    case 'REMOVE_EVENT_SOURCE':
      return removeSource(eventSources, action.sourceId)

    case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
    case 'NEXT':
    case 'SET_DATE':
    case 'SET_VIEW_TYPE':
      if (dateProfile) {
        return fetchDirtySources(eventSources, dateProfile.activeRange, calendar)
      } else {
        return eventSources
      }

    case 'FETCH_EVENT_SOURCES':
    case 'CHANGE_TIMEZONE':
      return fetchSourcesByIds(
        eventSources,
        (action as any).sourceIds ?
          arrayToHash((action as any).sourceIds) :
          excludeStaticSources(eventSources, calendar),
        dateProfile ? dateProfile.activeRange : null,
        calendar
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


let uid = 0


function addSources(eventSourceHash: EventSourceHash, sources: EventSource[], fetchRange: DateRange | null, calendar: Calendar): EventSourceHash {
  let hash: EventSourceHash = {}

  for (let source of sources) {
    hash[source.sourceId] = source
  }

  if (fetchRange) {
    hash = fetchDirtySources(hash, fetchRange, calendar)
  }

  return { ...eventSourceHash, ...hash }
}


function removeSource(eventSourceHash: EventSourceHash, sourceId: string): EventSourceHash {
  return filterHash(eventSourceHash, function(eventSource: EventSource) {
    return eventSource.sourceId !== sourceId
  })
}


function fetchDirtySources(sourceHash: EventSourceHash, fetchRange: DateRange, calendar: Calendar): EventSourceHash {
  return fetchSourcesByIds(
    sourceHash,
    filterHash(sourceHash, function(eventSource) {
      return isSourceDirty(eventSource, fetchRange, calendar)
    }),
    fetchRange,
    calendar
  )
}


function isSourceDirty(eventSource: EventSource, fetchRange: DateRange, calendar: Calendar) {

  if (!doesSourceNeedRange(eventSource, calendar)) {
    return !eventSource.latestFetchId
  } else {
    return !calendar.opt('lazyFetching') ||
      !eventSource.fetchRange ||
      fetchRange.start < eventSource.fetchRange.start ||
      fetchRange.end > eventSource.fetchRange.end
  }
}


function fetchSourcesByIds(
  prevSources: EventSourceHash,
  sourceIdHash: { [sourceId: string]: any },
  fetchRange: DateRange,
  calendar: Calendar
): EventSourceHash {
  let nextSources: EventSourceHash = {}

  for (let sourceId in prevSources) {
    let source = prevSources[sourceId]

    if (sourceIdHash[sourceId]) {
      nextSources[sourceId] = fetchSource(source, fetchRange, calendar)
    } else {
      nextSources[sourceId] = source
    }
  }

  return nextSources
}


function fetchSource(eventSource: EventSource, fetchRange: DateRange, calendar: Calendar) {
  let sourceDef = calendar.pluginSystem.hooks.eventSourceDefs[eventSource.sourceDefId]
  let fetchId = String(uid++)

  sourceDef.fetch(
    {
      eventSource,
      calendar,
      range: fetchRange
    },
    function(res) {
      let { rawEvents } = res
      let calSuccess = calendar.opt('eventSourceSuccess')
      let calSuccessRes
      let sourceSuccessRes

      if (eventSource.success) {
        sourceSuccessRes = eventSource.success(rawEvents, res.xhr)
      }
      if (calSuccess) {
        calSuccessRes = calSuccess(rawEvents, res.xhr)
      }

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
      let callFailure = calendar.opt('eventSourceFailure')

      console.warn(error.message, error)

      if (eventSource.failure) {
        eventSource.failure(error)
      }
      if (callFailure) {
        callFailure(error)
      }

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
        fetchRange
      }
    }
  }

  return sourceHash
}


function excludeStaticSources(eventSources: EventSourceHash, calendar: Calendar): EventSourceHash {
  return filterHash(eventSources, function(eventSource) {
    return doesSourceNeedRange(eventSource, calendar)
  })
}
