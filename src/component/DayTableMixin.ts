import Mixin from '../common/Mixin'
import { DateMarker, addDays, diffDays } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'

export interface DayTableInterface {
  dayDates: DateMarker[]
  daysPerRow: any
  rowCnt: any
  colCnt: any
  breakOnWeeks: boolean
  updateDayTable()
  getCellDate(row, col)
  getCellRange(row, col): DateRange
  sliceRangeByDay(range)
  sliceRangeByRow(range)
}

/*
A set of rendering and date-related methods for a visual component comprised of one or more rows of day columns.
Prerequisite: the object being mixed into needs to be a *Grid*
*/
export default class DayTableMixin extends Mixin implements DayTableInterface {

  breakOnWeeks: boolean // should create a new row for each week? not specified, so default is FALSY
  dayDates: DateMarker[] // whole-day dates for each column. left to right
  dayIndices: any // for each day from start, the offset
  daysPerRow: any
  rowCnt: any
  colCnt: any


  // Populates internal variables used for date calculation and rendering
  /*
  sets dayDates
  sets dayIndices ( dayoffset -> something )
  sets daysPerRow
  sets rowCnt
  sets colCnt
  */
  updateDayTable() {
    let view = (this as any).view
    let dateProfile = (this as any).props.dateProfile
    let date: DateMarker = dateProfile.renderRange.start
    let end: DateMarker = dateProfile.renderRange.end
    let dayIndex = -1
    let dayIndices = []
    let dayDates: DateMarker[] = []
    let daysPerRow
    let firstDay
    let rowCnt

    while (date < end) { // loop each day from start to end
      if (view.dateProfileGenerator.isHiddenDay(date)) {
        dayIndices.push(dayIndex + 0.5) // mark that it's between indices
      } else {
        dayIndex++
        dayIndices.push(dayIndex)
        dayDates.push(date)
      }
      date = addDays(date, 1)
    }

    if (this.breakOnWeeks) {
      // count columns until the day-of-week repeats
      firstDay = dayDates[0].getUTCDay()
      for (daysPerRow = 1; daysPerRow < dayDates.length; daysPerRow++) {
        if (dayDates[daysPerRow].getUTCDay() === firstDay) {
          break
        }
      }
      rowCnt = Math.ceil(dayDates.length / daysPerRow)
    } else {
      rowCnt = 1
      daysPerRow = dayDates.length
    }

    this.dayDates = dayDates
    this.dayIndices = dayIndices
    this.daysPerRow = daysPerRow
    this.rowCnt = rowCnt
    this.colCnt = this.computeColCnt()
  }


  // Determines how many columns there should be in the table
  computeColCnt() {
    return this.daysPerRow
  }


  // Computes the DateMarker for the given cell
  getCellDate(row, col): DateMarker {
    return this.dayDates[this.getCellDayIndex(row, col)]
  }


  // Computes the ambiguously-timed date range for the given cell
  getCellRange(row, col): DateRange {
    let start = this.getCellDate(row, col)
    let end = addDays(start, 1)

    return { start, end }
  }


  // Returns the number of day cells, chronologically, from the first of the grid (0-based)
  getCellDayIndex(row, col) {
    return row * this.daysPerRow + this.getColDayIndex(col)
  }


  // Returns the numner of day cells, chronologically, from the first cell in *any given row*
  getColDayIndex(col) {
    if ((this as any).isRtl) {
      return this.colCnt - 1 - col
    } else {
      return col
    }
  }


  // Given a date, returns its chronolocial cell-index from the first cell of the grid.
  // If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
  // If before the first offset, returns a negative number.
  // If after the last offset, returns an offset past the last cell offset.
  // Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
  getDateDayIndex(date) {
    let dayIndices = this.dayIndices
    let dayOffset = Math.floor(diffDays(this.dayDates[0], date))

    if (dayOffset < 0) {
      return dayIndices[0] - 1
    } else if (dayOffset >= dayIndices.length) {
      return dayIndices[dayIndices.length - 1] + 1
    } else {
      return dayIndices[dayOffset]
    }
  }


  /* Slicing
  ------------------------------------------------------------------------------------------------------------------*/


  // Slices up a date range into a segment for every week-row it intersects with
  // range already normalized to start-of-day
  sliceRangeByRow(range) {
    let daysPerRow = this.daysPerRow
    let rangeFirst = this.getDateDayIndex(range.start) // inclusive first index
    let rangeLast = this.getDateDayIndex(addDays(range.end, -1)) // inclusive last index
    let segs = []
    let row
    let rowFirst
    let rowLast // inclusive day-index range for current row
    let segFirst
    let segLast // inclusive day-index range for segment

    for (row = 0; row < this.rowCnt; row++) {
      rowFirst = row * daysPerRow
      rowLast = rowFirst + daysPerRow - 1

      // intersect segment's offset range with the row's
      segFirst = Math.max(rangeFirst, rowFirst)
      segLast = Math.min(rangeLast, rowLast)

      // deal with in-between indices
      segFirst = Math.ceil(segFirst) // in-between starts round to next cell
      segLast = Math.floor(segLast) // in-between ends round to prev cell

      if (segFirst <= segLast) { // was there any intersection with the current row?
        segs.push({
          row: row,

          // normalize to start of row
          firstRowDayIndex: segFirst - rowFirst,
          lastRowDayIndex: segLast - rowFirst,

          // must be matching integers to be the segment's start/end
          isStart: segFirst === rangeFirst,
          isEnd: segLast === rangeLast
        })
      }
    }

    return segs
  }


  // Slices up a date range into a segment for every day-cell it intersects with.
  // range already normalized to start-of-day
  // TODO: make more DRY with sliceRangeByRow somehow.
  sliceRangeByDay(range) {
    let daysPerRow = this.daysPerRow
    let rangeFirst = this.getDateDayIndex(range.start) // inclusive first index
    let rangeLast = this.getDateDayIndex(addDays(range.end, -1)) // inclusive last index
    let segs = []
    let row
    let rowFirst
    let rowLast // inclusive day-index range for current row
    let i
    let segFirst
    let segLast // inclusive day-index range for segment

    for (row = 0; row < this.rowCnt; row++) {
      rowFirst = row * daysPerRow
      rowLast = rowFirst + daysPerRow - 1

      for (i = rowFirst; i <= rowLast; i++) {

        // intersect segment's offset range with the row's
        segFirst = Math.max(rangeFirst, i)
        segLast = Math.min(rangeLast, i)

        // deal with in-between indices
        segFirst = Math.ceil(segFirst) // in-between starts round to next cell
        segLast = Math.floor(segLast) // in-between ends round to prev cell

        if (segFirst <= segLast) { // was there any intersection with the current row?
          segs.push({
            row: row,

            // normalize to start of row
            firstRowDayIndex: segFirst - rowFirst,
            lastRowDayIndex: segLast - rowFirst,

            // must be matching integers to be the segment's start/end
            isStart: segFirst === rangeFirst,
            isEnd: segLast === rangeLast
          })
        }
      }
    }

    return segs
  }

}
