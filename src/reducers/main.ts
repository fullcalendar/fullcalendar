import Calendar from '../Calendar'
import { DateProfile } from '../DateProfileGenerator'
import { EventSourceHash, reduceEventSourceHash } from './event-sources'
import { EventStore, reduceEventStore } from './event-store'
import { Selection } from './selection'
import { BusinessHourDef } from './business-hours'

export interface CalendarState {
  loadingLevel: number
  dateProfile: DateProfile
  eventSources: EventSourceHash
  eventStore: EventStore
  selection: Selection | null,
  dragState: {
    eventStore: EventStore
    origSeg: any
    isTouch: boolean
  } | null
  eventResizeState: {
    eventStore: EventStore
    origSeg: any
    isTouch: boolean
  } | null
  businessHoursDef: BusinessHourDef
}

export const INITIAL_STATE: CalendarState = {
  loadingLevel: 0,
  dateProfile: null,
  eventSources: {},
  eventStore: {
    defs: {},
    instances: {}
  },
  selection: null,
  dragState: null,
  eventResizeState: null,
  businessHoursDef: false
}

export function reduce(state: CalendarState, action: any, calendar: Calendar): CalendarState {
  return {
    loadingLevel: reduceLoadingLevel(state.loadingLevel, action),
    dateProfile: reduceDateProfile(state.dateProfile, action),
    eventSources: reduceEventSourceHash(state.eventSources, action, calendar),
    eventStore: reduceEventStore(state.eventStore, action, calendar),
    selection: state.selection,
    dragState: state.dragState,
    eventResizeState: state.eventResizeState,
    businessHoursDef: state.businessHoursDef
  }
}

function reduceDateProfile(currentDateProfile, action: any) {
  switch (action.type) {
    case 'SET_DATE_PROFILE':
      return action.dateProfile
    default:
      return currentDateProfile
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
