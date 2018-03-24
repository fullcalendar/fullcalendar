import * as moment from 'moment'
import { isInt } from '../util/misc'

export const dayIDs = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
export const unitsDesc = [ 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond' ] // descending


// Diffs the two moments into a Duration where full-days are recorded first, then the remaining time.
// Moments will have their timezones normalized.
export function diffDayTime(a, b) {
  return moment.duration({
    days: a.clone().stripTime().diff(b.clone().stripTime(), 'days'),
    ms: a.time() - b.time() // time-of-day from day start. disregards timezone
  })
}


// Diffs the two moments via their start-of-day (regardless of timezone). Produces whole-day durations.
export function diffDay(a, b) {
  return moment.duration({
    days: a.clone().stripTime().diff(b.clone().stripTime(), 'days')
  })
}


// Diffs two moments, producing a duration, made of a whole-unit-increment of the given unit. Uses rounding.
export function diffByUnit(a, b, unit) {
  return moment.duration(
    Math.round(a.diff(b, unit, true)), // returnFloat=true
    unit
  )
}


// Computes the unit name of the largest whole-unit period of time.
// For example, 48 hours will be "days" whereas 49 hours will be "hours".
// Accepts start/end, a range object, or an original duration object.
export function computeGreatestUnit(start, end?) {
  let i
  let unit
  let val

  for (i = 0; i < unitsDesc.length; i++) {
    unit = unitsDesc[i]
    val = computeRangeAs(unit, start, end)

    if (val >= 1 && isInt(val)) {
      break
    }
  }

  return unit // will be "milliseconds" if nothing else matches
}


// like computeGreatestUnit, but has special abilities to interpret the source input for clues
export function computeDurationGreatestUnit(duration, durationInput) {
  let unit = computeGreatestUnit(duration)

  // prevent days:7 from being interpreted as a week
  if (unit === 'week' && typeof durationInput === 'object' && durationInput && durationInput.days) { // non-null object
    unit = 'day'
  }

  return unit
}


// Computes the number of units (like "hours") in the given range.
// Range can be a {start,end} object, separate start/end args, or a Duration.
// Results are based on Moment's .as() and .diff() methods, so results can depend on internal handling
// of month-diffing logic (which tends to vary from version to version).
function computeRangeAs(unit, start, end) {

  if (end != null) { // given start, end
    return end.diff(start, unit, true)
  } else if (moment.isDuration(start)) { // given duration
    return start.as(unit)
  } else { // given { start, end } range object
    return start.end.diff(start.start, unit, true)
  }
}


// Intelligently divides a range (specified by a start/end params) by a duration
export function divideRangeByDuration(start, end, dur) {
  let months

  if (durationHasTime(dur)) {
    return (end - start) / dur
  }
  months = dur.asMonths()
  if (Math.abs(months) >= 1 && isInt(months)) {
    return end.diff(start, 'months', true) / months
  }
  return end.diff(start, 'days', true) / dur.asDays()
}


// Intelligently divides one duration by another
export function divideDurationByDuration(dur1, dur2) {
  let months1
  let months2

  if (durationHasTime(dur1) || durationHasTime(dur2)) {
    return dur1 / dur2
  }
  months1 = dur1.asMonths()
  months2 = dur2.asMonths()
  if (
    Math.abs(months1) >= 1 && isInt(months1) &&
    Math.abs(months2) >= 1 && isInt(months2)
  ) {
    return months1 / months2
  }
  return dur1.asDays() / dur2.asDays()
}


// Intelligently multiplies a duration by a number
export function multiplyDuration(dur, n) {
  let months

  if (durationHasTime(dur)) {
    return moment.duration(dur * n)
  }
  months = dur.asMonths()
  if (Math.abs(months) >= 1 && isInt(months)) {
    return moment.duration({ months: months * n })
  }
  return moment.duration({ days: dur.asDays() * n })
}


// Returns a boolean about whether the given duration has any time parts (hours/minutes/seconds/ms)
export function durationHasTime(dur) {
  return Boolean(dur.hours() || dur.minutes() || dur.seconds() || dur.milliseconds())
}


export function isNativeDate(input) {
  return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date
}


// Returns a boolean about whether the given input is a time string, like "06:40:00" or "06:00"
export function isTimeString(str) {
  return typeof str === 'string' &&
    /^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(str)
}
