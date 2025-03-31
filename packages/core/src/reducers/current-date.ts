import { DateMarker, addMs } from '../datelib/marker.js'
import { Action } from './Action.js'
import { CalendarContext } from '../CalendarContext.js'

export function reduceCurrentDate(currentDate: DateMarker, action: Action) {
  switch (action.type) {
    case 'CHANGE_DATE':
      return action.dateMarker
    default:
      return currentDate
  }
}

// should be initialized once and stay constant
export function getInitialDate(context: CalendarContext): DateMarker {
  let initialDateInput = context.options.initialDate

  // compute the initial ambig-timezone date
  if (initialDateInput != null) {
    return context.dateEnv.createMarker(initialDateInput)
  }

  return getNowDate(context)
}

export function getNowDate(context: {
  initialNowDate: DateMarker,
  initialNowQueriedMs: number,
}): DateMarker {
  return addMs(context.initialNowDate, new Date().valueOf() - context.initialNowQueriedMs)
}
