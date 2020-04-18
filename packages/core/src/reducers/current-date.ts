import { DateMarker } from '../datelib/marker'
import { Action } from './types'
import { DateProfile } from '../DateProfileGenerator'
import { rangeContainsMarker } from '../datelib/date-range'


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


export function getInitialDate(options, dateEnv) { // NOT used in this reducer. TODO: do INIT in reducer
  let initialDateInput = options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return dateEnv.createMarker(initialDateInput)
  } else {
    return getNow(options, dateEnv) // getNow already returns unzoned
  }
}


export function getNow(options, dateEnv) {
  let now = options.now

  if (typeof now === 'function') {
    now = now()
  }

  if (now == null) {
    return dateEnv.createNowMarker()
  }

  return dateEnv.createMarker(now)
}
