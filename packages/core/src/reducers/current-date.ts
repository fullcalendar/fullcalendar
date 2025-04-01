import { DateMarker } from '../datelib/marker.js'
import { Action } from './Action.js'
import { CalendarOptionsRefined } from '../options.js'
import { DateEnv } from '../datelib/env.js'
import { CalendarNowManager } from './CalendarNowManager.js'

export function reduceCurrentDate(currentDate: DateMarker, action: Action) {
  switch (action.type) {
    case 'CHANGE_DATE':
      return action.dateMarker
    default:
      return currentDate
  }
}

// should be initialized once and stay constant
// this will change too
export function getInitialDate(
  options: CalendarOptionsRefined,
  dateEnv: DateEnv,
  nowManager: CalendarNowManager,
): DateMarker {
  let initialDateInput = options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return dateEnv.createMarker(initialDateInput)
  }

  return nowManager.getDateMarker()
}
