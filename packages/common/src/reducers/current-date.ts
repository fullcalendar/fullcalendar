import { DateEnv } from '../datelib/env'


// not a lot of reducing happening in here


export function getInitialDate(options, dateEnv: DateEnv) { // NOT used in this reducer. TODO: do INIT in reducer
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
