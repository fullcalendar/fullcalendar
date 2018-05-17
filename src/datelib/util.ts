import { Duration } from './duration'

export type DateMarker = Date

export function nowMarker(): DateMarker {
  return arrayToUtcDate(dateToLocalArray(new Date()))
}


export const dayIDs = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
export const unitsDesc = [ 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond' ] // descending


// export function markersEqual(m0: DateMarker, m1)


export function dateToLocalArray(date) {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ]
}

export function arrayToLocalDate(arr) {
  if (!arr.length) {
    return new Date()
  }
  return new Date(
    arr[0],
    arr[1] || 0,
    arr[2] || 1,
    arr[3] || 0,
    arr[4] || 0,
    arr[5] || 0,
  )
}

export function dateToUtcArray(date) {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ]
}

export function arrayToUtcDate(arr) {
  return new Date(Date.UTC.apply(Date, arr))
}


export function addWeeks(m: DateMarker, n: number) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate() + n * 7,
    m.getUTCHours(),
    m.getUTCMinutes(),
    m.getUTCSeconds(),
    m.getUTCMilliseconds()
  ))
}


export function addDays(m: DateMarker, n: number) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate() + n,
    m.getUTCHours(),
    m.getUTCMinutes(),
    m.getUTCSeconds(),
    m.getUTCMilliseconds()
  ))
}

export function addMs(m: DateMarker, n: number) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes(),
    m.getUTCSeconds(),
    m.getUTCMilliseconds() + n
  ))
}

export function startOfDay(m: DateMarker) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate()
  ))
}

export function startOfHour(m: DateMarker) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours()
  ))
}

export function startOfMinute(m: DateMarker) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes()
  ))
}

export function startOfSecond(m: DateMarker) {
  return new Date(Date.UTC(
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes(),
    m.getUTCSeconds()
  ))
}


const MS_IN_HOUR = 1000 * 60 * 60
const MS_IN_MINUTE = 1000 * 60

export function computeGreatestDurationDenominator(dur: Duration, considerWeeks: boolean = false) {
  if (dur.year) {
    return { unit: 'year', value: dur.year }
  } else if (dur.month) {
    return { unit: 'month', value: dur.month }
  } else if (considerWeeks && dur.day && dur.day % 7 === 0) {
    return { unit: 'week', value: dur.day / 7 }
  } else if (dur.day) {
    return { unit: 'day', value: dur.day }
  } else if (dur.time) {
    if (dur.time % MS_IN_HOUR === 0) {
      return { unit: 'hour', value: dur.time / MS_IN_HOUR }
    } else if (dur.time % MS_IN_MINUTE === 0) {
      return { unit: 'minute', value: dur.time / MS_IN_MINUTE }
    } else if (dur.time % 1000 === 0) {
      return { unit: 'second', value: dur.time / 1000 }
    } else {
      return { unit: 'millisecond', value: dur.time }
    }
  }
}
