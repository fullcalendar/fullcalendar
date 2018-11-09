import { DateRange, intersectRanges } from '../datelib/date-range'
import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { Seg } from '../component/DateComponent'
import { addDays, DateMarker } from '../datelib/marker'
import DaySeries from '../common/DaySeries'


export default class DayGridSlicer {

  dateProfile: DateProfile
  daySeries: DaySeries
  daysPerRow: number
  isRtl: boolean
  rowCnt: number
  colCnt: number


  constructor(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, isRtl: boolean, breakOnWeeks: boolean) {
    let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)
    let { dates } = daySeries
    let daysPerRow
    let firstDay
    let rowCnt

    if (breakOnWeeks) {
      // count columns until the day-of-week repeats
      firstDay = dates[0].getUTCDay()
      for (daysPerRow = 1; daysPerRow < dates.length; daysPerRow++) {
        if (dates[daysPerRow].getUTCDay() === firstDay) {
          break
        }
      }
      rowCnt = Math.ceil(dates.length / daysPerRow)
    } else {
      rowCnt = 1
      daysPerRow = dates.length
    }

    this.dateProfile = dateProfile
    this.daySeries = daySeries
    this.daysPerRow = daysPerRow
    this.isRtl = isRtl
    this.rowCnt = rowCnt
    this.colCnt = daysPerRow
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  rangeToSegs(range: DateRange): Seg[] {

    range = intersectRanges(range, this.dateProfile.validRange)

    if (range) {
      let segs = this.sliceRangeByRow(range)

      for (let i = 0; i < segs.length; i++) {
        let seg = segs[i]
        seg.component = this

        if (this.isRtl) {
          seg.leftCol = this.daysPerRow - 1 - seg.lastRowDayIndex
          seg.rightCol = this.daysPerRow - 1 - seg.firstRowDayIndex
        } else {
          seg.leftCol = seg.firstRowDayIndex
          seg.rightCol = seg.lastRowDayIndex
        }
      }

      return segs
    } else {
      return []
    }
  }


  sliceRangeByRow(range) {
    let { daysPerRow } = this
    let seriesSeg = this.daySeries.sliceRange(range)
    let segs = []

    if (seriesSeg) {
      let { firstIndex, lastIndex } = seriesSeg
      let index = firstIndex

      while (index <= lastIndex) {
        let row = Math.floor(index / daysPerRow)
        let nextIndex = Math.min((row + 1) * daysPerRow, lastIndex + 1)

        segs.push({
          row,
          firstRowDayIndex: index % daysPerRow,
          lastRowDayIndex: (nextIndex - 1) % daysPerRow,
          isStart: seriesSeg.isStart && index === firstIndex,
          isEnd: seriesSeg.isEnd && (nextIndex - 1) === lastIndex
        })

        index = nextIndex
      }
    }

    return segs
  }


  // Computes the DateMarker for the given cell
  getCellDate(row, col): DateMarker {
    return this.daySeries.dates[this.getCellDayIndex(row, col)]
  }


  // Computes the ambiguously-timed date range for the given cell
  getCellRange(row, col): DateRange {
    let start = this.getCellDate(row, col)
    let end = addDays(start, 1)

    return { start, end }
  }


  // Returns the number of day cells, chronologically, from the first of the grid (0-based)
  private getCellDayIndex(row, col) {
    return row * this.daysPerRow + this.getColDayIndex(col)
  }


  // Returns the numner of day cells, chronologically, from the first cell in *any given row*
  private getColDayIndex(col) {
    if (this.isRtl) {
      return this.colCnt - 1 - col
    } else {
      return col
    }
  }

}
