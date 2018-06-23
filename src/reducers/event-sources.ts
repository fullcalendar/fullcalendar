import { assignTo } from '../util/object'
import UnzonedRange from '../models/UnzonedRange'
import Calendar from '../Calendar'
import { EventInput } from './event-store'
import { ClassNameInput, parseClassName, refineProps } from './utils'
import { warn } from '../util/misc'

// types

export interface EventSourceInput {
  id?: string | number
  allDayDefault?: boolean
  eventDataTransform?: any
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  overlap?: any
  constraint?: any
  rendering?: string
  className?: ClassNameInput
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  success?: (eventInputs: EventInput[]) => void
  failure?: (errorObj: any) => void
  [otherProp: string]: any
}

export interface EventSource {
  sourceId: string
  sourceType: string
  sourceTypeMeta: any
  publicId: string
  isFetching: boolean
  latestFetchId: string | null
  fetchRange: UnzonedRange
  allDayDefault: boolean | null
  eventDataTransform: any
  editable: boolean | null
  startEditable: boolean | null
  durationEditable: boolean | null
  overlap: any
  constraint: any
  rendering: string | null
  className: string[]
  color: string | null
  backgroundColor: string | null
  borderColor: string | null
  textColor: string | null
  success?: (eventInputs: EventInput[]) => void
  failure?: (errorObj: any) => void
}

export type EventSourceHash = { [sourceId: string]: EventSource }

export interface EventSourceTypeSettings {
  parseMeta: (raw: any) => any
  fetch: (
    arg: {
      eventSource: EventSource
      calendar: Calendar
      range: UnzonedRange
    },
    success: (rawEvents: EventInput) => void,
    failure: (errorObj: any) => void
  ) => void
}

// vars

const SIMPLE_SOURCE_PROPS = {
  allDayDefault: Boolean,
  eventDataTransform: null,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  overlap: null,
  constraint: null,
  rendering: String,
  className: parseClassName,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String,
  success: null,
  failure: null
}

let sourceTypes: { [sourceTypeName: string]: EventSourceTypeSettings } = {}
let guid = 0

// reducers

export function reduceEventSourceHash(sourceHash: EventSourceHash, action: any, calendar: Calendar): EventSourceHash {
  let eventSource

  switch (action.type) {

    case 'ADD_EVENT_SOURCE':
      eventSource = parseSource(action.rawSource)

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

      let fetchId = String(guid++)
      sourceTypes[eventSource.sourceType].fetch(
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
          if (typeof eventSource.success === 'function') {
            eventSource.success(action.rawEvents)
          }
        } else { // failure
          warn(action.error.message, action.error)

          if (typeof eventSource.failure === 'function') {
            eventSource.failure(action.error)
          }
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

// parsing

export function registerSourceType(type: string, settings: EventSourceTypeSettings) {
  sourceTypes[type] = settings
}

function parseSource(raw: EventSourceInput): EventSource {
  for (let sourceTypeName in sourceTypes) {
    let sourceTypeSettings = sourceTypes[sourceTypeName]
    let sourceTypeMeta = sourceTypeSettings.parseMeta(raw)

    if (sourceTypeMeta) {
      let source: EventSource = refineProps(raw, SIMPLE_SOURCE_PROPS)
      source.sourceId = String(guid++)
      source.sourceType = sourceTypeName
      source.sourceTypeMeta = sourceTypeMeta

      if (raw.id != null) {
        source.publicId = String(raw.id)
      }

      return source
    }
  }

  return null
}
