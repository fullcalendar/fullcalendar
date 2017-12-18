import * as moment from 'moment'
import momentExt from '../moment-ext'

export default class UnzonedRange {

  startMs: number // if null, no start constraint
  endMs: number // if null, no end constraint

  // TODO: move these into footprint.
  // Especially, doesn't make sense for null startMs/endMs.
  isStart: boolean = true
  isEnd: boolean = true

  constructor(startInput?, endInput?) {

    if (moment.isMoment(startInput)) {
      startInput = (startInput.clone() as any).stripZone()
    }

    if (moment.isMoment(endInput)) {
      endInput = (endInput.clone() as any).stripZone()
    }

    if (startInput) {
      this.startMs = startInput.valueOf()
    }

    if (endInput) {
      this.endMs = endInput.valueOf()
    }
  }


  /*
  SIDEEFFECT: will mutate eventRanges.
  Will return a new array result.
  Only works for non-open-ended ranges.
  */
  static invertRanges(ranges, constraintRange) {
    let invertedRanges = []
    let startMs = constraintRange.startMs // the end of the previous range. the start of the new range
    let i
    let dateRange

    // ranges need to be in order. required for our date-walking algorithm
    ranges.sort(compareUnzonedRanges)

    for (i = 0; i < ranges.length; i++) {
      dateRange = ranges[i]

      // add the span of time before the event (if there is any)
      if (dateRange.startMs > startMs) { // compare millisecond time (skip any ambig logic)
        invertedRanges.push(
          new UnzonedRange(startMs, dateRange.startMs)
        )
      }

      if (dateRange.endMs > startMs) {
        startMs = dateRange.endMs
      }
    }

    // add the span of time after the last event (if there is any)
    if (startMs < constraintRange.endMs) { // compare millisecond time (skip any ambig logic)
      invertedRanges.push(
        new UnzonedRange(startMs, constraintRange.endMs)
      )
    }

    return invertedRanges
  }


  intersect(otherRange) {
    let startMs = this.startMs
    let endMs = this.endMs
    let newRange = null

    if (otherRange.startMs != null) {
      if (startMs == null) {
        startMs = otherRange.startMs
      } else {
        startMs = Math.max(startMs, otherRange.startMs)
      }
    }

    if (otherRange.endMs != null) {
      if (endMs == null) {
        endMs = otherRange.endMs
      } else {
        endMs = Math.min(endMs, otherRange.endMs)
      }
    }

    if (startMs == null || endMs == null || startMs < endMs) {
      newRange = new UnzonedRange(startMs, endMs)
      newRange.isStart = this.isStart && startMs === this.startMs
      newRange.isEnd = this.isEnd && endMs === this.endMs
    }

    return newRange
  }


  intersectsWith(otherRange) {
    return (this.endMs == null || otherRange.startMs == null || this.endMs > otherRange.startMs) &&
      (this.startMs == null || otherRange.endMs == null || this.startMs < otherRange.endMs)
  }


  containsRange(innerRange) {
    return (this.startMs == null || (innerRange.startMs != null && innerRange.startMs >= this.startMs)) &&
      (this.endMs == null || (innerRange.endMs != null && innerRange.endMs <= this.endMs))
  }


  // `date` can be a moment, a Date, or a millisecond time.
  containsDate(date) {
    let ms = date.valueOf()

    return (this.startMs == null || ms >= this.startMs) &&
      (this.endMs == null || ms < this.endMs)
  }


  // If the given date is not within the given range, move it inside.
  // (If it's past the end, make it one millisecond before the end).
  // `date` can be a moment, a Date, or a millisecond time.
  // Returns a MS-time.
  constrainDate(date) {
    let ms = date.valueOf()

    if (this.startMs != null && ms < this.startMs) {
      ms = this.startMs
    }

    if (this.endMs != null && ms >= this.endMs) {
      ms = this.endMs - 1
    }

    return ms
  }


  equals(otherRange) {
    return this.startMs === otherRange.startMs && this.endMs === otherRange.endMs
  }


  clone() {
    let range = new UnzonedRange(this.startMs, this.endMs)

    range.isStart = this.isStart
    range.isEnd = this.isEnd

    return range
  }


  // Returns an ambig-zoned moment from startMs.
  // BEWARE: returned moment is not localized.
  // Formatting and start-of-week will be default.
  getStart() {
    if (this.startMs != null) {
      return momentExt.utc(this.startMs).stripZone()
    }
    return null
  }

  // Returns an ambig-zoned moment from startMs.
  // BEWARE: returned moment is not localized.
  // Formatting and start-of-week will be default.
  getEnd() {
    if (this.endMs != null) {
      return momentExt.utc(this.endMs).stripZone()
    }
    return null
  }


  as(unit) {
    return moment.utc(this.endMs).diff(
      moment.utc(this.startMs),
      unit,
      true
    )
  }

}


/*
Only works for non-open-ended ranges.
*/
function compareUnzonedRanges(range1, range2) {
  return range1.startMs - range2.startMs // earlier ranges go first
}
