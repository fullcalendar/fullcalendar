import { DateEnv, DateInput } from '../datelib/env.js'
import { DateMarker } from '../datelib/marker.js'
import { Action } from './Action.js'
import { BaseOptionsRefined } from '../options.js'

export function reduceCurrentDate(currentDate: DateMarker, action: Action) {
  switch (action.type) {
    case 'CHANGE_DATE':
      return action.dateMarker
    default:
      return currentDate
  }
}

export function getInitialDate(options: BaseOptionsRefined, dateEnv: DateEnv) {
  let initialDateInput = options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return dateEnv.createMarker(initialDateInput)
  }
  return getNow(options.now, dateEnv) // getNow already returns unzoned
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
