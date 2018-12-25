import { Duration } from './duration'

export type DateMarker = Date

export const DAY_IDS = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]


// Adding

export function addWeeks(m: DateMarker, n: number) {
  let a = dateToUtcArray(m)
  a[2] += n * 7
  return arrayToUtcDate(a)
}

export function addDays(m: DateMarker, n: number) {
  let a = dateToUtcArray(m)
  a[2] += n
  return arrayToUtcDate(a)
}

export function addMs(m: DateMarker, n: number) {
  let a = dateToUtcArray(m)
  a[6] += n
  return arrayToUtcDate(a)
}


// Diffing (all return floats)

export function diffWeeks(m0, m1) {
  return diffDays(m0, m1) / 7
}

export function diffDays(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / (1000 * 60 * 60 * 24)
}

export function diffHours(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / (1000 * 60 * 60)
}

export function diffMinutes(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / (1000 * 60)
}

export function diffSeconds(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / 1000
}

export function diffDayAndTime(m0: DateMarker, m1: DateMarker): Duration {
  let m0day = startOfDay(m0)
  let m1day = startOfDay(m1)

  return {
    years: 0,
    months: 0,
    days: Math.round(diffDays(m0day, m1day)),
    milliseconds: (m1.valueOf() - m1day.valueOf()) - (m0.valueOf() - m0day.valueOf())
  }
}


// Diffing Whole Units

export function diffWholeWeeks(m0: DateMarker, m1: DateMarker): number {
  let d = diffWholeDays(m0, m1)

  if (d !== null && d % 7 === 0) {
    return d / 7
  }

  return null
}

export function diffWholeDays(m0: DateMarker, m1: DateMarker): number {
  if (timeAsMs(m0) === timeAsMs(m1)) {
    return Math.round(diffDays(m0, m1))
  }
  return null
}


// Start-Of

export function startOfDay(m: DateMarker): DateMarker {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate()
  ])
}

export function startOfHour(m: DateMarker) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours()
  ])
}

export function startOfMinute(m: DateMarker) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes()
  ])
}

export function startOfSecond(m: DateMarker) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes(),
    m.getUTCSeconds()
  ])
}


// Week Computation

export function weekOfYear(marker, dow, doy) {
  let y = marker.getUTCFullYear()
  let w = weekOfGivenYear(marker, y, dow, doy)

  if (w < 1) {
    return weekOfGivenYear(marker, y - 1, dow, doy)
  }

  let nextW = weekOfGivenYear(marker, y + 1, dow, doy)
  if (nextW >= 1) {
    return Math.min(w, nextW)
  }

  return w
}

function weekOfGivenYear(marker, year, dow, doy) {
  let firstWeekStart = arrayToUtcDate([ year, 0, 1 + firstWeekOffset(year, dow, doy) ])
  let dayStart = startOfDay(marker)
  let days = Math.round(diffDays(firstWeekStart, dayStart))

  return Math.floor(days / 7) + 1 // zero-indexed
}

// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {

  // first-week day -- which january is always in the first week (4 for iso, 1 for other)
  let fwd = 7 + dow - doy

  // first-week day local weekday -- which local weekday is fwd
  let fwdlw = (7 + arrayToUtcDate([ year, 0, fwd ]).getUTCDay() - dow) % 7

  return -fwdlw + fwd - 1
}


// Array Conversion

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

export function arrayToLocalDate(a) {
  return new Date(
    a[0],
    a[1] || 0,
    a[2] == null ? 1 : a[2], // day of month
    a[3] || 0,
    a[4] || 0,
    a[5] || 0
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

export function arrayToUtcDate(a) {

  // according to web standards (and Safari), a month index is required.
  // massage if only given a year.
  if (a.length === 1) {
    a = a.concat([ 0 ])
  }

  return new Date(Date.UTC.apply(Date, a))
}


// Other Utils

export function isValidDate(m: DateMarker) {
  return !isNaN(m.valueOf())
}

export function timeAsMs(m: DateMarker) {
  return m.getUTCHours() * 1000 * 60 * 60 +
    m.getUTCMinutes() * 1000 * 60 +
    m.getUTCSeconds() * 1000 +
    m.getUTCMilliseconds()
}
