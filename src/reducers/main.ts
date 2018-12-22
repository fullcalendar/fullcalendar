import Calendar from '../Calendar'
import reduceEventSources from './eventSources'
import reduceEventStore from './eventStore'
import { DateProfile, isDateProfilesEqual } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { CalendarState, Action } from './types'
import { EventSourceHash } from '../structs/event-source'

export default function(state: CalendarState, action: Action, calendar: Calendar): CalendarState {

  let viewType = reduceViewType(state.viewType, action)
  let dateProfile = reduceDateProfile(state.dateProfile, action, viewType, calendar)
  let eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendar)

  let nextState = {
    ...state,
    viewType,
    dateProfile,
    eventSources,
    eventStore: reduceEventStore(state.eventStore, action, eventSources, dateProfile, calendar),
    dateSelection: reduceDateSelection(state.dateSelection, action, calendar),
    eventSelection: reduceSelectedEvent(state.eventSelection, action),
    eventDrag: reduceEventDrag(state.eventDrag, action, eventSources, calendar),
    eventResize: reduceEventResize(state.eventResize, action, eventSources, calendar),
    eventSourceLoadingLevel: computeLoadingLevel(eventSources),
    loadingLevel: computeLoadingLevel(eventSources)
  }

  for (let reducerFunc of calendar.pluginSystem.hooks.reducers) {
    nextState = reducerFunc(nextState, action, calendar)
  }

  // console.log(action.type, nextState)

  return nextState
}

function reduceViewType(currentViewType: string, action: Action): string {
  switch (action.type) {
    case 'SET_VIEW_TYPE':
      return action.viewType
    default:
      return currentViewType
  }
}

function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action, viewType: string, calendar: Calendar): DateProfile {
  switch (action.type) {
    case 'SET_DATE_PROFILE':
      return protectSameDateProfile(
        action.dateProfile,
        currentDateProfile
      )
    case 'SET_DATE':
    case 'SET_VIEW_TYPE':
      return protectSameDateProfile(
        calendar.dateProfileGenerators[viewType].build(
          action.dateMarker || currentDateProfile.currentDate,
          undefined,
          true // forceToValid=true
        ),
        currentDateProfile
      )
    default:
      return currentDateProfile
  }
}

function reduceDateSelection(currentSelection: DateSpan | null, action: Action, calendar: Calendar) {
  switch (action.type) {
    case 'SELECT_DATES':
      return action.selection
    case 'UNSELECT_DATES':
      return null
    default:
      return currentSelection
  }
}

function reduceSelectedEvent(currentInstanceId: string, action: Action): string {
  switch (action.type) {
    case 'SELECT_EVENT':
      return action.eventInstanceId
    case 'UNSELECT_EVENT':
      return ''
    default:
      return currentInstanceId
  }
}

function reduceEventDrag(currentDrag: EventInteractionState | null, action: Action, sources: EventSourceHash, calendar: Calendar): EventInteractionState | null {
  switch (action.type) {

    case 'SET_EVENT_DRAG':
      let newDrag = action.state

      return {
        affectedEvents: newDrag.affectedEvents,
        mutatedEvents: newDrag.mutatedEvents,
        isEvent: newDrag.isEvent,
        origSeg: newDrag.origSeg
      }

    case 'UNSET_EVENT_DRAG':
      return null

    default:
      return currentDrag
  }
}

function reduceEventResize(currentResize: EventInteractionState | null, action: Action, sources: EventSourceHash, calendar: Calendar): EventInteractionState | null {
  switch (action.type) {

    case 'SET_EVENT_RESIZE':
      let newResize = action.state

      return {
        affectedEvents: newResize.affectedEvents,
        mutatedEvents: newResize.mutatedEvents,
        isEvent: newResize.isEvent,
        origSeg: newResize.origSeg
      }

    case 'UNSET_EVENT_RESIZE':
      return null

    default:
      return currentResize
  }
}

function protectSameDateProfile(newDateProfile, oldDateProfile) {
  if (newDateProfile && oldDateProfile && isDateProfilesEqual(newDateProfile, oldDateProfile)) {
    return oldDateProfile
  }

  return newDateProfile
}

function computeLoadingLevel(eventSources: EventSourceHash): number {
  let cnt = 0

  for (let sourceId in eventSources) {
    if (eventSources[sourceId].isFetching) {
      cnt++
    }
  }

  return cnt
}
