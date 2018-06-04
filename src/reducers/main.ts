import UnzonedRange from '../models/UnzonedRange'
import Calendar from '../Calendar'
import { EventSourceHash, reduceEventSourceHash } from './event-sources'
import { EventStore, reduceEventStore } from './event-store'

export interface CalendarState {
  loadingLevel: number
  activeRange: UnzonedRange
  eventSources: EventSourceHash
  eventStore: EventStore
}

export const INITIAL_STATE: CalendarState = {
  loadingLevel: 0,
  activeRange: null,
  eventSources: {},
  eventStore: {
    defs: {},
    instances: {}
  }
}

export function reduce(state: CalendarState, action: any, calendar: Calendar): CalendarState {
  return {
    loadingLevel: reduceLoadingLevel(state.loadingLevel, action),
    activeRange: reduceActiveRange(state.activeRange, action),
    eventSources: reduceEventSourceHash(state.eventSources, action, calendar),
    eventStore: reduceEventStore(state.eventStore, action, calendar)
  }
}

function reduceActiveRange(currentActiveRange, action: any) {
  switch (action.type) {
    case 'SET_ACTIVE_RANGE':
      return action.range
    default:
      return currentActiveRange
  }
}

function reduceLoadingLevel(level: number, action): number {
  switch (action.type) {
    case 'FETCH_EVENT_SOURCE':
      return level + 1
    case 'RECEIVE_EVENT_SOURCE':
    case 'ERROR_EVENT_SOURCE':
      return level - 1
    default:
      return level
  }
}
