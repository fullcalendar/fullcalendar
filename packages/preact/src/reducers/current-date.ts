import { DateEnv, DateMarker } from '@full-ui/headless-calendar'
import { Action } from './Action'
import { CalendarOptionsRefined } from '../options'
import { CalendarNowManager } from './CalendarNowManager'

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
