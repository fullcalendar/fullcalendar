import { PositionCache, DateMarker, startOfDay, createDuration, asRoughMs, DateProfile, Duration, rangeContainsMarker } from '@fullcalendar/core'


export default class TimeColsSlatsCoords {

  constructor(
    public positions: PositionCache,
    private dateProfile: DateProfile,
    private slotDuration: Duration
  ) {
  }


  safeComputeTop(date: DateMarker) {
    if (rangeContainsMarker(this.dateProfile.currentRange, date)) {
      return this.computeDateTop(date)
    }
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given date.
  // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
  computeDateTop(when: DateMarker, startOfDayDate?: DateMarker) {
    if (!startOfDayDate) {
      startOfDayDate = startOfDay(when)
    }
    return this.computeTimeTop(createDuration(when.valueOf() - startOfDayDate.valueOf()))
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
  computeTimeTop(duration: Duration) {
    let { positions, dateProfile, slotDuration } = this
    let len = positions.els.length
    let slatCoverage = (duration.milliseconds - asRoughMs(dateProfile.minTime)) / asRoughMs(slotDuration) // floating-point value of # of slots covered
    let slatIndex
    let slatRemainder

    // compute a floating-point number for how many slats should be progressed through.
    // from 0 to number of slats (inclusive)
    // constrained because minTime/maxTime might be customized.
    slatCoverage = Math.max(0, slatCoverage)
    slatCoverage = Math.min(len, slatCoverage)

    // an integer index of the furthest whole slat
    // from 0 to number slats (*exclusive*, so len-1)
    slatIndex = Math.floor(slatCoverage)
    slatIndex = Math.min(slatIndex, len - 1)

    // how much further through the slatIndex slat (from 0.0-1.0) must be covered in addition.
    // could be 1.0 if slatCoverage is covering *all* the slots
    slatRemainder = slatCoverage - slatIndex

    return positions.tops[slatIndex] +
      positions.getHeight(slatIndex) * slatRemainder
  }

}
