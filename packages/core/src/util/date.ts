import { DateMarker, startOfDay, addDays, diffDays, diffDayAndTime } from '../datelib/marker.js'
import { Duration, asRoughMs, createDuration } from '../datelib/duration.js'
import { DateEnv } from '../datelib/env.js'
import { DateRange, OpenDateRange } from '../datelib/date-range.js'

/* Date stuff that doesn't belong in datelib core
----------------------------------------------------------------------------------------------------------------------*/

// given a timed range, computes an all-day range that has the same exact duration,
// but whose start time is aligned with the start of the day.
export function computeAlignedDayRange(timedRange: DateRange): DateRange {
  let dayCnt = Math.floor(diffDays(timedRange.start, timedRange.end)) || 1
  let start = startOfDay(timedRange.start)
  let end = addDays(start, dayCnt)
  return { start, end }
}

// given a timed range, computes an all-day range based on how for the end date bleeds into the next day
// TODO: give nextDayThreshold a default arg
export function computeVisibleDayRange(timedRange: OpenDateRange, nextDayThreshold: Duration = createDuration(0)): OpenDateRange {
  let startDay: DateMarker = null
  let endDay: DateMarker = null

  if (timedRange.end) {
    endDay = startOfDay(timedRange.end)

    let endTimeMS: number = timedRange.end.valueOf() - endDay.valueOf() // # of milliseconds into `endDay`

    // If the end time is actually inclusively part of the next day and is equal to or
    // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
    // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
    if (endTimeMS && endTimeMS >= asRoughMs(nextDayThreshold)) {
      endDay = addDays(endDay, 1)
    }
  }

  if (timedRange.start) {
    startDay = startOfDay(timedRange.start) // the beginning of the day the range starts

    // If end is within `startDay` but not past nextDayThreshold, assign the default duration of one day.
    if (endDay && endDay <= startDay) {
      endDay = addDays(startDay, 1)
    }
  }

  return { start: startDay, end: endDay }
}

// spans from one day into another?
export function isMultiDayRange(range: DateRange) {
  let visibleRange = computeVisibleDayRange(range)

  return diffDays(visibleRange.start, visibleRange.end) > 1
}

export function diffDates(date0: DateMarker, date1: DateMarker, dateEnv: DateEnv, largeUnit?: string) {
  if (largeUnit === 'year') {
    return createDuration(dateEnv.diffWholeYears(date0, date1), 'year')!
  }

  if (largeUnit === 'month') {
    return createDuration(dateEnv.diffWholeMonths(date0, date1), 'month')!
  }

  return diffDayAndTime(date0, date1) // returns a duration
}
