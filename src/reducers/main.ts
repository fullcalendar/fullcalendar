import Calendar from '../Calendar'
import reduceEventSources from './eventSources'
import reduceEventStore from './eventStore'
import { DateProfile, isDateProfilesEqual } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { CalendarState, Action } from './types'
import { EventSourceHash } from '../structs/event-source'
import { computeEventDefUis } from '../component/event-rendering'

export default function(state: CalendarState, action: Action, calendar: Calendar): CalendarState {
  calendar.publiclyTrigger(action.type, action) // for testing hooks

  let dateProfile = reduceDateProfile(state.dateProfile, action)
  let eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendar)

  return {
    dateProfile,
    eventSources,
    eventStore: reduceEventStore(state.eventStore, action, eventSources, dateProfile, calendar),
    eventUis: state.eventUis, // TODO: should really be internal state
    businessHours: state.businessHours,
    dateSelection: reduceDateSelection(state.dateSelection, action, calendar),
    eventSelection: reduceSelectedEvent(state.eventSelection, action),
    eventDrag: reduceEventDrag(state.eventDrag, action, eventSources, calendar),
    eventResize: reduceEventResize(state.eventResize, action, eventSources, calendar),
    eventSourceLoadingLevel: computeLoadingLevel(eventSources),
    loadingLevel: computeLoadingLevel(eventSources)
  }
}

function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action) {
  switch (action.type) {
    case 'SET_DATE_PROFILE':
      return (currentDateProfile && isDateProfilesEqual(currentDateProfile, action.dateProfile)) ?
        currentDateProfile : // if same, reuse the same object, better for rerenders
        action.dateProfile
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

function reduceEventDrag(currentDrag: EventInteractionUiState | null, action: Action, sources: EventSourceHash, calendar: Calendar): EventInteractionUiState | null {
  switch (action.type) {

    case 'SET_EVENT_DRAG':
      let newDrag = action.state
      let eventUis = computeEventDefUis(
        newDrag.mutatedEvents.defs,
        sources,
        calendar.view ? calendar.view.options : {} // yuck
      )
      return {
        affectedEvents: newDrag.affectedEvents,
        mutatedEvents: newDrag.mutatedEvents,
        isEvent: newDrag.isEvent,
        origSeg: newDrag.origSeg,
        eventUis: eventUis
      }

    case 'UNSET_EVENT_DRAG':
      return null

    default:
      return currentDrag
  }
}

function reduceEventResize(currentResize: EventInteractionUiState | null, action: Action, sources: EventSourceHash, calendar: Calendar): EventInteractionUiState | null {
  switch (action.type) {

    case 'SET_EVENT_RESIZE':
      let newResize = action.state
      let eventUis = computeEventDefUis(
        newResize.mutatedEvents.defs,
        sources,
        calendar.view ? calendar.view.options : {} // yuck
      )
      return {
        affectedEvents: newResize.affectedEvents,
        mutatedEvents: newResize.mutatedEvents,
        isEvent: newResize.isEvent,
        origSeg: newResize.origSeg,
        eventUis
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
