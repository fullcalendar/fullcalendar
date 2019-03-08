import Calendar from '../Calendar'
import reduceEventSources from './eventSources'
import reduceEventStore from './eventStore'
import { DateProfile, isDateProfilesEqual } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { CalendarState, Action } from './types'
import { EventSourceHash } from '../structs/event-source'
import { DateMarker } from '../datelib/marker'
import { rangeContainsMarker } from '../datelib/date-range'

export default function(state: CalendarState, action: Action, calendar: Calendar): CalendarState {

  let viewType = reduceViewType(state.viewType, action)
  let dateProfile = reduceDateProfile(state.dateProfile, action, state.currentDate, viewType, calendar)
  let eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendar)

  let nextState = {
    ...state,
    viewType,
    dateProfile,
    currentDate: reduceCurrentDate(state.currentDate, action, dateProfile),
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

function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action, currentDate: DateMarker, viewType: string, calendar: Calendar): DateProfile {
  let newDateProfile: DateProfile

  switch (action.type) {

    case 'PREV':
      newDateProfile = calendar.dateProfileGenerators[viewType].buildPrev(currentDateProfile, currentDate)
      break

    case 'NEXT':
      newDateProfile = calendar.dateProfileGenerators[viewType].buildNext(currentDateProfile, currentDate)
      break

    case 'SET_DATE':
      if (
        !currentDateProfile.activeRange ||
        !rangeContainsMarker(currentDateProfile.currentRange, action.dateMarker)
      ) {
        newDateProfile = calendar.dateProfileGenerators[viewType].build(
          action.dateMarker,
          undefined,
          true // forceToValid
        )
      }
      break

    case 'SET_VIEW_TYPE':
      let generator = calendar.dateProfileGenerators[viewType]

      if (!generator) {
        throw new Error(
          viewType ?
            'The FullCalendar view "' + viewType + '" does not exist. Make sure your plugins are loaded correctly.' :
            'No available FullCalendar view plugins.'
        )
      }

      newDateProfile = generator.build(
        action.dateMarker || currentDate,
        undefined,
        true // forceToValid
      )
      break
  }

  if (
    newDateProfile &&
    newDateProfile.isValid &&
    !(currentDateProfile && isDateProfilesEqual(currentDateProfile, newDateProfile))
  ) {
    return newDateProfile
  } else {
    return currentDateProfile
  }
}

function reduceCurrentDate(currentDate: DateMarker, action: Action, dateProfile: DateProfile): DateMarker {
  switch (action.type) {

    case 'PREV':
    case 'NEXT':
      if (!rangeContainsMarker(dateProfile.currentRange, currentDate)) {
        return dateProfile.currentRange.start
      } else {
        return currentDate
      }

    case 'SET_DATE':
    case 'SET_VIEW_TYPE':
      let newDate = action.dateMarker || currentDate
      if (dateProfile.activeRange && !rangeContainsMarker(dateProfile.activeRange, newDate)) {
        return dateProfile.currentRange.start
      } else {
        return newDate
      }

    default:
      return currentDate
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

function computeLoadingLevel(eventSources: EventSourceHash): number {
  let cnt = 0

  for (let sourceId in eventSources) {
    if (eventSources[sourceId].isFetching) {
      cnt++
    }
  }

  return cnt
}
