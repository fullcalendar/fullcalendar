import Calendar from '../Calendar'
import reduceEventSources from './eventSources'
import reduceEventStore from './eventStore'
import { DateProfile } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { CalendarState, Action } from './types'
import { EventSourceHash } from '../structs/event-source'

export default function(state: CalendarState, action: Action, calendar: Calendar): CalendarState {
  calendar.trigger(action.type, action) // for testing hooks

  let dateProfile = reduceDateProfile(state.dateProfile, action)
  let eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendar)

  return {
    dateProfile,
    eventSources,
    eventStore: reduceEventStore(state.eventStore, action, eventSources, calendar),
    businessHoursDef: state.businessHoursDef, // TODO: rename?
    selection: reduceDateSelection(state.selection, action), // TODO: rename
    selectedEventInstanceId: reduceSelectedEvent(state.selectedEventInstanceId, action),
    dragState: reduceDrag(state.dragState, action),
    eventResizeState: reduceEventResize(state.eventResizeState, action),
    loadingLevel: reduceLoadingLevel(state.loadingLevel, action, eventSources)
  }
}

function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action) {
  switch (action.type) {
    case 'SET_DATE_PROFILE':
      return action.dateProfile
    default:
      return currentDateProfile
  }
}

function reduceDateSelection(currentSelection: DateSpan | null, action: Action) {
  switch (action.type) {
    case 'SELECT': // TODO: rename
      return action.selection
    case 'UNSELECT': // TODO: rename
      return null
    default:
      return currentSelection
  }
}

function reduceSelectedEvent(currentInstanceId: string, action: Action): string {
  switch (action.type) {
    case 'SELECT_EVENT':
      return action.eventInstanceId
    case 'CLEAR_SELECTED_EVENT':
      return ''
    default:
      return currentInstanceId
  }
}

function reduceDrag(currentDrag: EventInteractionState | null, action: Action) {
  switch (action.type) {
    case 'SET_DRAG':
      return action.dragState
    case 'CLEAR_DRAG':
      return null
    default:
      return currentDrag
  }
}

function reduceEventResize(currentEventResize: EventInteractionState | null, action: Action) {
  switch (action.type) {
    case 'SET_EVENT_RESIZE':
      return action.eventResizeState
    case 'CLEAR_EVENT_RESIZE':
      return null
    default:
      return currentEventResize
  }
}

function reduceLoadingLevel(level: number, action: Action, eventSources: EventSourceHash): number {
  switch (action.type) {
    case 'FETCH_EVENT_SOURCES':
      return level + (action.sourceIds ? action.sourceIds.length : Object.keys(eventSources).length)
    case 'RECEIVE_EVENTS':
    case 'RECEIVE_EVENT_ERROR':
      return level - 1
    default:
      return level
  }
}
