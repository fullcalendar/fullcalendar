import { assignTo } from '../util/object'
import UnzonedRange from '../models/UnzonedRange'
import Calendar from '../Calendar'
import { EventInput } from './event-store'
import { ClassNameInput, parseClassName, refineProps } from './utils'

// types

export interface AbstractEventSourceInput {
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
}

export type EventSourceHash = { [sourceId: string]: EventSource }

export interface EventSourceTypeSettings {
  parse: (raw: any) => any
  fetch: (
    arg: {
      eventSource: EventSource
      calendar: Calendar
      range: UnzonedRange
    },
    success: (rawEvents: EventInput) => void,
    failure: () => void
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
  textColor: String
}

let sourceTypes: { [sourceTypeName: string]: EventSourceTypeSettings} = {}
let guid = 0

// reducers

export function reduceEventSourceHash(sourceHash: EventSourceHash, action: any, calendar: Calendar): EventSourceHash {
  let eventSource

  switch (action.type) {

    case 'ADD_EVENT_SOURCE':
      eventSource = parseSource(action.rawSource)

      if (eventSource) {
        if (calendar.state.activeRange) {
          calendar.dispatch({
            type: 'FETCH_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            range: calendar.state.activeRange
          })
        }
        return assignTo({}, sourceHash, {
          [eventSource.sourceId]: eventSource
        })
      } else {
        return sourceHash
      }

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
        function() {
          calendar.dispatch({
            type: 'ERROR_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            fetchId,
            fetchRange: action.range
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
    case 'ERROR_EVENT_SOURCE': // TODO: call calendar's/source's error handlers maybe
      eventSource = sourceHash[action.sourceId]

      if (eventSource.latestFetchId === action.fetchId) {
        return assignTo({}, sourceHash, {
          [eventSource.sourceId]: assignTo({}, eventSource, {
            isFetching: false,
            fetchRange: action.fetchRange
          })
        })
      } else {
        return sourceHash
      }

    case 'SET_ACTIVE_RANGE':
      for (let sourceId in sourceHash) {
        eventSource = sourceHash[sourceId]

        if (
          !eventSource.fetchRange ||
          eventSource.fetchRange.start < action.range.start ||
          eventSource.fetchRange.end > action.range.end
        ) {
          calendar.dispatch({
            type: 'FETCH_EVENT_SOURCE',
            sourceId: eventSource.sourceId,
            range: action.range
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

function parseSource(raw: AbstractEventSourceInput): EventSource {
  for (let sourceTypeName in sourceTypes) {
    let sourceTypeSettings = sourceTypes[sourceTypeName]
    let sourceTypeMeta = sourceTypeSettings.parse(raw)

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
