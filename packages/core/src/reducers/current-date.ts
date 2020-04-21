import { DateMarker } from '../datelib/marker'
import { Action } from './types'
import { DateProfile } from '../DateProfileGenerator'
import { rangeContainsMarker } from '../datelib/date-range'
import { DateEnv } from '../datelib/env'
import { ReducerContext } from '../reducers/ReducerContext'


export function reduceCurrentDate(currentDate: DateMarker, action: Action, dateProfile: DateProfile): DateMarker {
  // on INIT, currentDate will already be set

  switch (action.type) {

    case 'CHANGE_DATE':
    case 'CHANGE_VIEW_TYPE':
      if (action.dateMarker) {
        currentDate = action.dateMarker
      }
      // fall through...
    case 'INIT':
      if (dateProfile.activeRange && !rangeContainsMarker(dateProfile.activeRange, currentDate)) {
        return dateProfile.currentRange.start
      } else {
        return currentDate
      }

    case 'PREV':
    case 'NEXT':
      if (!rangeContainsMarker(dateProfile.currentRange, currentDate)) {
        return dateProfile.currentRange.start
      } else {
        return currentDate
      }

    default:
      return currentDate
  }
}


export function getInitialDate(context: ReducerContext) { // NOT used in this reducer. TODO: do INIT in reducer
  let initialDateInput = context.options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return context.dateEnv.createMarker(initialDateInput)
  } else {
    return getNow(context) // getNow already returns unzoned
  }
}


export function getNow(context: ReducerContext) {
  return _getNow(context.options, context.dateEnv)
}


export function _getNow(options, dateEnv: DateEnv) {
  let now = options.now

  if (typeof now === 'function') {
    now = now()
  }

  if (now == null) {
    return dateEnv.createNowMarker()
  }

  return dateEnv.createMarker(now)
}
