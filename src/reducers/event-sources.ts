import { assignTo } from '../util/object'
import Calendar from '../Calendar'
import { warn } from '../util/misc'
import { EventSource, EventSourceHash, parseEventSource, getEventSourceDef } from '../structs/event-source'

let uid = 0

// reducers

export function reduceEventSourceHash(sourceHash: EventSourceHash, action: any, calendar: Calendar): EventSourceHash {
  let eventSource: EventSource

  switch (action.type) {

    case 'ADD_EVENT_SOURCE':
      eventSource = parseEventSource(action.rawSource)

      if (eventSource) {
        if (calendar.state.dateProfile) {
          calendar.dispatch({
            type: 'FETCH_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            range: calendar.state.dateProfile.activeUnzonedRange
          })
        }
        return assignTo({}, sourceHash, {
          [eventSource.sourceId]: eventSource
        })
      } else {
        return sourceHash
      }

    case 'FETCH_ALL_EVENT_SOURCES':
      for (let sourceId in sourceHash) {
        calendar.dispatch({
          type: 'FETCH_EVENT_SOURCE',
          sourceId,
          range: calendar.state.dateProfile.activeUnzonedRange
        })
      }
      return sourceHash

    case 'FETCH_EVENT_SOURCE':
      eventSource = sourceHash[action.sourceId]

      let fetchId = String(uid++)

      getEventSourceDef(eventSource.sourceDefId).fetch(
        {
          eventSource,
          calendar,
          range: action.range
        },
        function(rawEvents) {
          calendar.dispatch({
            type: 'RECEIVE_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            fetchId,
            fetchRange: action.range,
            rawEvents
          })
        },
        function(errorInput) {
          let errorObj

          if (typeof errorInput === 'string') {
            errorObj = { message: errorInput }
          } else {
            errorObj = errorInput || {}
          }

          calendar.dispatch({
            type: 'ERROR_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            fetchId,
            fetchRange: action.range,
            error: errorObj
          })
        }
      )

      return assignTo({}, sourceHash, {
        [eventSource.sourceId]: assignTo({}, eventSource, {
          isFetching: true,
          latestFetchId: fetchId
        })
      })

    case 'RECEIVE_EVENT_SOURCE':
    case 'ERROR_EVENT_SOURCE':
      eventSource = sourceHash[action.sourceId]

      if (eventSource.latestFetchId === action.fetchId) {

        if (action.type === 'RECEIVE_EVENT_SOURCE') {
          eventSource.success(action.rawEvents)
        } else { // failure
          warn(action.error.message, action.error)
          eventSource.failure(action.error)
        }

        return assignTo({}, sourceHash, {
          [eventSource.sourceId]: assignTo({}, eventSource, {
            isFetching: false,
            fetchRange: action.fetchRange
          })
        })
      } else {
        return sourceHash
      }

    case 'SET_DATE_PROFILE':
      let activeRange = action.dateProfile.activeUnzonedRange

      for (let sourceId in sourceHash) {
        eventSource = sourceHash[sourceId]

        if (
          !calendar.opt('lazyFetching') ||
          !eventSource.fetchRange ||
          eventSource.fetchRange.start < activeRange.start ||
          eventSource.fetchRange.end > activeRange.end
        ) {
          calendar.dispatch({
            type: 'FETCH_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            range: activeRange
          })
        }
      }

      return sourceHash

    default:
      return sourceHash
  }
}
