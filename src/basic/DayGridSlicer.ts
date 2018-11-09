import { DateRange, intersectRanges } from '../datelib/date-range'
import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { Seg } from '../component/DateComponent'
import { addDays, DateMarker } from '../datelib/marker'
import DaySeries from '../common/DaySeries'
import DayTable from '../common/DayTable'

export default class DayGridSlicer {

  private dayTable: DayTable
  dateProfile: DateProfile
  isRtl: boolean
  rowCnt: number
  colCnt: number


  constructor(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, isRtl: boolean, breakOnWeeks: boolean) {
    let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)
    let dayTable = new DayTable(daySeries, breakOnWeeks)

    this.dayTable = dayTable
    this.rowCnt = dayTable.rowCnt
    this.colCnt = dayTable.colCnt
    this.dateProfile = dateProfile
    this.isRtl = isRtl
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  rangeToSegs(range: DateRange): Seg[] {
    let colCnt = this.dayTable.colCnt

    range = intersectRanges(range, this.dateProfile.validRange)

    if (range) {
      return this.dayTable.sliceRange(range)
        .map((dayTableSeg) => {
          return {
            isStart: dayTableSeg.isStart,
            isEnd: dayTableSeg.isEnd,
            row: dayTableSeg.row,
            leftCol: this.isRtl ? (colCnt - 1 - dayTableSeg.lastCol) : dayTableSeg.firstCol,
            rightCol: this.isRtl ? (colCnt - 1 - dayTableSeg.firstCol) : dayTableSeg.lastCol
          }
        })
    }

    return []
  }


  // Computes the DateMarker for the given cell
  getCellDate(row, col): DateMarker {
    return this.dayTable.getDate(row, col)
  }


  // Computes the ambiguously-timed date range for the given cell
  getCellRange(row, col): DateRange {
    let start = this.getCellDate(row, col)
    let end = addDays(start, 1)

    return { start, end }
  }


}
