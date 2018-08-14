import { DateMarker } from './marker'
import { DateEnv, DateInput } from './env'

export interface DateRangeInput {
  start?: DateInput
  end?: DateInput
}

export interface OpenDateRange {
  start: DateMarker | null
  end: DateMarker | null
}

export interface DateRange {
  start: DateMarker
  end: DateMarker
}

export function parseRange(input: DateRangeInput, dateEnv: DateEnv): OpenDateRange {
  let start = null
  let end = null

  if (input.start) {
    start = dateEnv.createMarker(input.start)
  }

  if (input.end) {
    end = dateEnv.createMarker(input.end)
  }

  if (!start && !end) {
    return null
  }

  if (start && end && end < start) {
    return null
  }

  return { start, end }
}

// SIDE-EFFECT: will mutate ranges.
// Will return a new array result.
export function invertRanges(ranges: DateRange[], constraintRange: DateRange): DateRange[] {
  let invertedRanges: DateRange[] = []
  let start = constraintRange.start // the end of the previous range. the start of the new range
  let i
  let dateRange

  // ranges need to be in order. required for our date-walking algorithm
  ranges.sort(compareRanges)

  for (i = 0; i < ranges.length; i++) {
    dateRange = ranges[i]

    // add the span of time before the event (if there is any)
    if (dateRange.start > start) { // compare millisecond time (skip any ambig logic)
      invertedRanges.push({ start, end: dateRange.start })
    }

    if (dateRange.end > start) {
      start = dateRange.end
    }
  }

  // add the span of time after the last event (if there is any)
  if (start < constraintRange.end) { // compare millisecond time (skip any ambig logic)
    invertedRanges.push({ start, end: constraintRange.end })
  }

  return invertedRanges
}

function compareRanges(range0: DateRange, range1: DateRange) {
  return range0.start.valueOf() - range1.start.valueOf() // earlier ranges go first
}

export function intersectRanges(range0: OpenDateRange, range1: OpenDateRange): OpenDateRange {
  let start = range0.start
  let end = range0.end
  let newRange = null

  if (range1.start !== null) {
    if (start === null) {
      start = range1.start
    } else {
      start = new Date(Math.max(start.valueOf(), range1.start.valueOf()))
    }
  }

  if (range1.end != null) {
    if (end === null) {
      end = range1.end
    } else {
      end = new Date(Math.min(end.valueOf(), range1.end.valueOf()))
    }
  }

  if (start === null || end === null || start < end) {
    newRange = { start, end }
  }

  return newRange
}

export function rangesEqual(range0: OpenDateRange, range1: OpenDateRange): boolean {
  return (range0.start === null ? null : range0.start.valueOf()) === (range1.start === null ? null : range1.start.valueOf()) &&
    (range0.end === null ? null : range0.end.valueOf()) === (range1.end === null ? null : range1.end.valueOf())
}

export function rangesIntersect(range0: OpenDateRange, range1: OpenDateRange): boolean {
  return (range0.end === null || range1.start === null || range0.end > range1.start) &&
    (range0.start === null || range1.end === null || range0.start < range1.end)
}

export function rangeContainsRange(outerRange: OpenDateRange, innerRange: OpenDateRange): boolean {
  return (outerRange.start === null || (innerRange.start !== null && innerRange.start >= outerRange.start)) &&
    (outerRange.end === null || (innerRange.end !== null && innerRange.end <= outerRange.end))
}

export function rangeContainsMarker(range: OpenDateRange, date: DateMarker | number): boolean { // date can be a millisecond time
  return (range.start === null || date >= range.start) &&
    (range.end === null || date < range.end)
}

// If the given date is not within the given range, move it inside.
// (If it's past the end, make it one millisecond before the end).
export function constrainMarkerToRange(date: DateMarker, range: DateRange): DateMarker {
  if (range.start != null && date < range.start) {
    return range.start
  }

  if (range.end != null && date >= range.end) {
    return new Date(range.end.valueOf() - 1)
  }

  return date
}
