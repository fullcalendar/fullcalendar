import { DateMarker } from '../datelib/marker'

export default class UnzonedRange {

  start: DateMarker // if null, no start constraint
  end: DateMarker // if null, no end constraint


  constructor(start?: DateMarker, end?: DateMarker) {

    if (start) {
      this.start = start
    }

    if (end) {
      this.end = end
    }
  }


  /*
  SIDEEFFECT: will mutate eventRanges.
  Will return a new array result.
  Only works for non-open-ended ranges.
  */
  static invertRanges(ranges: UnzonedRange[], constraintRange: UnzonedRange) {
    let invertedRanges = []
    let start = constraintRange.start // the end of the previous range. the start of the new range
    let i
    let dateRange

    // ranges need to be in order. required for our date-walking algorithm
    ranges.sort(compareUnzonedRanges)

    for (i = 0; i < ranges.length; i++) {
      dateRange = ranges[i]

      // add the span of time before the event (if there is any)
      if (dateRange.start > start) { // compare millisecond time (skip any ambig logic)
        invertedRanges.push(
          new UnzonedRange(start, dateRange.start)
        )
      }

      if (dateRange.end > start) {
        start = dateRange.end
      }
    }

    // add the span of time after the last event (if there is any)
    if (start < constraintRange.end) { // compare millisecond time (skip any ambig logic)
      invertedRanges.push(
        new UnzonedRange(start, constraintRange.end)
      )
    }

    return invertedRanges
  }


  intersect(otherRange: UnzonedRange): UnzonedRange {
    let start = this.start
    let end = this.end
    let newRange = null

    if (otherRange.start != null) {
      if (start == null) {
        start = otherRange.start
      } else {
        start = new Date(Math.max(start.valueOf(), otherRange.start.valueOf()))
      }
    }

    if (otherRange.end != null) {
      if (end == null) {
        end = otherRange.end
      } else {
        end = new Date(Math.min(end.valueOf(), otherRange.end.valueOf()))
      }
    }

    if (start == null || end == null || start < end) {
      newRange = new UnzonedRange(start, end)
    }

    return newRange
  }


  intersectsWith(otherRange: UnzonedRange) {
    return (this.end == null || otherRange.start == null || this.end > otherRange.start) &&
      (this.start == null || otherRange.end == null || this.start < otherRange.end)
  }


  containsRange(innerRange: UnzonedRange) {
    return (this.start == null || (innerRange.start != null && innerRange.start >= this.start)) &&
      (this.end == null || (innerRange.end != null && innerRange.end <= this.end))
  }


  // `date` can be a Date, or a millisecond time.
  containsDate(date: Date) {
    return (this.start == null || date >= this.start) &&
      (this.end == null || date < this.end)
  }


  // If the given date is not within the given range, move it inside.
  // (If it's past the end, make it one millisecond before the end).
  constrainDate(date: Date): Date {

    if (this.start != null && date < this.start) {
      return this.start
    }

    if (this.end != null && date >= this.end) {
      return new Date(this.end.valueOf() - 1)
    }

    return date
  }


  equals(otherRange) {
    return (this.start == null ? null : this.start.valueOf()) === (otherRange.start == null ? null : otherRange.start.valueOf()) &&
      (this.end == null ? null : this.end.valueOf()) === (otherRange.end == null ? null : otherRange.end.valueOf())
  }


  clone() {
    return new UnzonedRange(this.start, this.end)
  }

}


/*
Only works for non-open-ended ranges.
*/
function compareUnzonedRanges(range1: UnzonedRange, range2: UnzonedRange) {
  return range1.start.valueOf() - range2.start.valueOf() // earlier ranges go first
}
