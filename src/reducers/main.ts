import Calendar from '../Calendar'
import { DateComponentRenderState } from '../component/DateComponent'
import { EventSourceHash } from '../structs/event-source'
import { reduceEventSourceHash } from './event-sources'
import { reduceEventStore } from './event-store'
import { DateProfile } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'

export interface CalendarState extends DateComponentRenderState {
  loadingLevel: number
  eventSources: EventSourceHash
}

export function reduce(state: CalendarState, action: any, calendar: Calendar): CalendarState {
  calendar.trigger(action.type, action) // for testing hooks

  return {
    dateProfile: reduceDateProfile(state.dateProfile, action),
    eventSources: reduceEventSourceHash(state.eventSources, action, calendar),
    eventStore: reduceEventStore(state.eventStore, action, calendar),
    businessHoursDef: state.businessHoursDef, // TODO: rename?
    selection: reduceDateSelection(state.selection, action), // TODO: rename
    selectedEventInstanceId: reduceSelectedEvent(state.selectedEventInstanceId, action),
    dragState: reduceDrag(state.dragState, action),
    eventResizeState: reduceEventResize(state.eventResizeState, action),
    loadingLevel: reduceLoadingLevel(state.loadingLevel, action)
  }
}

function reduceDateProfile(currentDateProfile: DateProfile, action: any) {
  switch (action.type) {
    case 'SET_DATE_PROFILE':
      return action.dateProfile
    default:
      return currentDateProfile
  }
}

function reduceDateSelection(currentSelection: DateSpan, action: any) {
  switch (action.type) {
    case 'SELECT': // TODO: rename
      return action.selection
    case 'UNSELECT': // TODO: rename
      return null
    default:
      return currentSelection
  }
}

function reduceSelectedEvent(currentInstanceId: string, action: any): string {
  switch (action.type) {
    case 'SELECT_EVENT':
      return action.eventInstanceId
    case 'CLEAR_SELECTED_EVENT':
      return ''
    default:
      return currentInstanceId
  }
}

function reduceDrag(currentDrag: EventInteractionState, action: any) {
  switch (action.type) {
    case 'SET_DRAG':
      return action.dragState
    case 'CLEAR_DRAG':
      return null
    default:
      return currentDrag
  }
}

function reduceEventResize(currentEventResize: EventInteractionState, action: any) {
  switch (action.type) {
    case 'SET_EVENT_RESIZE':
      return action.eventResizeState
    case 'CLEAR_EVENT_RESIZE':
      return null
    default:
      return currentEventResize
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
