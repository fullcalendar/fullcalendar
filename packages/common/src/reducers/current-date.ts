import { DateEnv } from '../datelib/env'
import { DateMarker } from '../datelib/marker'
import { Action } from './Action'


export function reduceCurrentDate(currentDate: DateMarker, action: Action) {
  switch (action.type) {
    case 'CHANGE_DATE':
      return action.dateMarker
    default:
      return currentDate
  }
}


export function getInitialDate(options, dateEnv: DateEnv) {
  let initialDateInput = options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return dateEnv.createMarker(initialDateInput)
  } else {
    return getNow(options, dateEnv) // getNow already returns unzoned
  }
}


export function getNow(options, dateEnv: DateEnv) {
  let now = options.now

  if (typeof now === 'function') {
    now = now()
  }

  if (now == null) {
    return dateEnv.createNowMarker()
  }

  return dateEnv.createMarker(now)
}
