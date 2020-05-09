import { DateEnv, DateInput } from '../datelib/env'
import { DateMarker } from '../datelib/marker'
import { Action } from './Action'
import { RefinedBaseOptions } from '../options'


export function reduceCurrentDate(currentDate: DateMarker, action: Action) {
  switch (action.type) {
    case 'CHANGE_DATE':
      return action.dateMarker
    default:
      return currentDate
  }
}


export function getInitialDate(options: RefinedBaseOptions, dateEnv: DateEnv) {
  let initialDateInput = options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return dateEnv.createMarker(initialDateInput)
  } else {
    return getNow(options.now, dateEnv) // getNow already returns unzoned
  }
}


export function getNow(nowInput: DateInput | (() => DateInput), dateEnv: DateEnv) {

  if (typeof nowInput === 'function') {
    nowInput = nowInput()
  }

  if (nowInput == null) {
    return dateEnv.createNowMarker()
  }

  return dateEnv.createMarker(nowInput)
}
