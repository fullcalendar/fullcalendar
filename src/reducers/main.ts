import Calendar from '../Calendar'
import { DateProfile } from '../DateProfileGenerator'
import { EventSourceHash, reduceEventSourceHash } from './event-sources'
import { EventStore, reduceEventStore } from './event-store'
import { Selection } from './selection'
import { BusinessHourDef } from './business-hours'
import { DragState } from './drag'
import { EventResizeState } from './event-resize'
import { DateMarker } from '../datelib/marker'

export interface DateComponentRenderState {
  dateProfile: DateProfile
  eventStore: EventStore
  selection: Selection | null
  dragState: DragState | null
  eventResizeState: EventResizeState | null
  businessHoursDef: BusinessHourDef
}

export interface CalendarState extends DateComponentRenderState {
  loadingLevel: number
  eventSources: EventSourceHash
  currentDate: DateMarker
}

export function reduce(state: CalendarState, action: any, calendar: Calendar): CalendarState {
  let newState = {
    loadingLevel: reduceLoadingLevel(state.loadingLevel, action),
    eventSources: reduceEventSourceHash(state.eventSources, action, calendar),
    eventStore: reduceEventStore(state.eventStore, action, calendar),
    dateProfile: state.dateProfile,
    currentDate: state.currentDate,
    selection: state.selection,
    dragState: state.dragState,
    eventResizeState: state.eventResizeState,
    businessHoursDef: state.businessHoursDef,
  }

  switch(action.type) {

    case 'SET_VIEW_TYPE':
      if (!calendar.view || calendar.view.type !== action.viewType) {
        calendar.installNewView(action.viewType)
        calendar.dispatch({
          type: 'SET_DATE_PROFILE',
          dateProfile: calendar.view.computeNewDateProfile(
            action.dateMarker || state.currentDate
          ) || calendar.view.dateProfile // ummmm.... to get same reference
        })
      }
      break

    case 'SET_DATE_PROFILE':
      if (action.dateProfile.isValid) {
        newState.dateProfile = action.dateProfile
        newState.currentDate = action.dateProfile.date // might have been constrained by view dates

        calendar.onDateProfileChange(action.dateProfile)
      }
      break

    case 'NAVIGATE_PREV':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.dateProfileGenerator.buildPrev(newState.dateProfile)
      })
      break

    case 'NAVIGATE_NEXT':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.dateProfileGenerator.buildNext(newState.dateProfile)
      })
      break

    case 'NAVIGATE_TODAY':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.computeNewDateProfile(calendar.getNow())
      })
      break

    case 'NAVIGATE_PREV_YEAR':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.computeNewDateProfile(
          calendar.dateEnv.addYears(newState.currentDate, -1)
        )
      })
      break

    case 'NAVIGATE_NEXT_YEAR':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.computeNewDateProfile(
          calendar.dateEnv.addYears(newState.currentDate, 1)
        )
      })
      break

    case 'NAVIGATE_DATE':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.computeNewDateProfile(action.dateMarker)
      })
      break

    case 'NAVIGATE_DELTA':
      calendar.dispatch({
        type: 'SET_DATE_PROFILE',
        dateProfile: calendar.view.computeNewDateProfile(
          calendar.dateEnv.add(newState.currentDate, action.delta)
        )
      })
      break

  }

  return newState
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
