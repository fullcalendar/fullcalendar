import { EventSource, EventSourceHash, getEventSourceDef } from '../structs/event-source'
import Calendar from '../Calendar'
import { arrayToHash, assignTo, filterHash } from '../util/object'
import { DateRange } from '../datelib/date-range'
import { warn } from '../util/misc'
import { DateProfile } from '../DateProfileGenerator'
import { Action, SimpleError } from './types'

export default function(eventSourceHash: EventSourceHash, action: Action, dateProfile: DateProfile | null, calendar: Calendar): EventSourceHash {
  switch (action.type) {

    case 'ADD_EVENT_SOURCES': // already parsed
      return addSources(eventSourceHash, action.sources, dateProfile, calendar)

    case 'REMOVE_EVENT_SOURCE':
      return removeSource(eventSourceHash, action.sourceId)

    case 'SET_DATE_PROFILE':
      return fetchDirtySources(eventSourceHash, action.dateProfile, calendar)

    case 'FETCH_EVENT_SOURCES':
      if (dateProfile) {
        return fetchSourcesById(eventSourceHash, action.sourceIds || null, dateProfile, calendar)
      } else {
        return eventSourceHash // can't fetch if don't know the framing range
      }

    case 'RECEIVE_EVENTS':
    case 'RECEIVE_EVENT_ERROR':
      return receiveResponse(eventSourceHash, action.sourceId, action.fetchId, action.fetchRange)

    case 'REMOVE_ALL_EVENT_SOURCES':
      return {}

    default:
      return eventSourceHash
  }
}

let uid = 0

function addSources(eventSourceHash: EventSourceHash, sources: EventSource[], dateProfile: DateProfile | null, calendar: Calendar): EventSourceHash {
  let hash: EventSourceHash = {}

  for (let source of sources) {
    hash[source.sourceId] = source
  }

  if (dateProfile) {
    hash = fetchDirtySources(hash, dateProfile, calendar)
  }

  return assignTo({}, eventSourceHash, hash)
}

function removeSource(eventSourceHash: EventSourceHash, sourceId: string): EventSourceHash {
  return filterHash(eventSourceHash, function(eventSource: EventSource) {
    return eventSource.sourceId !== sourceId
  })
}

function fetchDirtySources(sourceHash: EventSourceHash, dateProfile: DateProfile, calendar: Calendar): EventSourceHash {
  let activeRange = dateProfile.activeRange
  let dirtySourceIds = []

  for (let sourceId in sourceHash) {
    let eventSource = sourceHash[sourceId]

    if (
      !calendar.opt('lazyFetching') ||
      !eventSource.fetchRange ||
      activeRange.start < eventSource.fetchRange.start ||
      activeRange.end > eventSource.fetchRange.end
    ) {
      dirtySourceIds.push(eventSource.sourceId)
    }
  }

  if (dirtySourceIds.length) {
    return fetchSourcesById(sourceHash, dirtySourceIds, dateProfile, calendar)
  }

  return sourceHash
}

function fetchSourcesById(
  prevSources: EventSourceHash,
  sourceIds: string[] | null,
  dateProfile: DateProfile,
  calendar: Calendar
): EventSourceHash {
  let sourceIdHash = sourceIds ? arrayToHash(sourceIds) : null
  let nextSources: EventSourceHash = {}
  let activeRange = dateProfile.activeRange

  for (let sourceId in prevSources) {
    let source = prevSources[sourceId]

    if (!sourceIdHash || sourceIdHash[sourceId]) {
      let fetchId = String(uid++)

      fetchSource(source, activeRange, fetchId, calendar)

      nextSources[sourceId] = assignTo({}, source, {
        isFetching: true,
        latestFetchId: fetchId
      })
    } else {
      nextSources[sourceId] = source
    }
  }

  return nextSources
}

function fetchSource(eventSource: EventSource, range: DateRange, fetchId: string, calendar: Calendar) {
  getEventSourceDef(eventSource.sourceDefId).fetch(
    {
      eventSource,
      calendar,
      range
    },
    function(rawEvents) {

      if (eventSource.success) {
        eventSource.success(rawEvents)
      }

      calendar.dispatch({
        type: 'RECEIVE_EVENTS',
        sourceId: eventSource.sourceId,
        fetchId,
        fetchRange: range,
        rawEvents
      })
    },
    function(errorInput) {
      let error = normalizeError(errorInput)

      warn(error.message, error)

      if (eventSource.failure) {
        eventSource.failure(error)
      }

      calendar.dispatch({
        type: 'RECEIVE_EVENT_ERROR',
        sourceId: eventSource.sourceId,
        fetchId,
        fetchRange: range,
        error
      })
    }
  )
}

function receiveResponse(sourceHash: EventSourceHash, sourceId: string, fetchId: string, fetchRange: DateRange) {
  let eventSource: EventSource = sourceHash[sourceId]

  if (fetchId === eventSource.latestFetchId) {
    return assignTo({}, sourceHash, {
      [sourceId]: assignTo({}, eventSource, {
        isFetching: false,
        fetchRange
      })
    })
  }

  return sourceHash
}

function normalizeError(input: any): SimpleError {
  if (typeof input === 'string') {
    return { message: input }
  } else {
    return input || {}
  }
}
