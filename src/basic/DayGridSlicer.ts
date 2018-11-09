import { DateRange, intersectRanges } from '../datelib/date-range'
import { Seg } from '../component/DateComponent'
import { addDays, DateMarker } from '../datelib/marker'
import DayTable from '../common/DayTable'
import { EventRenderRange } from '../component/event-rendering';
import { DateSpan } from '../structs/date-span';

export default class DayGridSlicer {

  rowCnt: number
  colCnt: number

  private dayTable: DayTable
  private isRtl: boolean


  constructor(dayTable: DayTable, isRtl: boolean) {
    this.dayTable = dayTable
    this.rowCnt = dayTable.rowCnt
    this.colCnt = dayTable.colCnt
    this.isRtl = isRtl
  }


  eventRangeToSegs(eventRange: EventRenderRange, component) {
    let range = intersectRanges(eventRange.range, component.props.dateProfile.validRange)

    if (range) {
      return this.rangeToSegs(range).map(function(seg) {
        seg.component = component
        return seg
      })
    }

    return []
  }


  dateSpanToSegs(dateSpan: DateSpan, component) {
    let range = intersectRanges(dateSpan.range, component.props.dateProfile.validRange)

    if (range) {
      return this.rangeToSegs(range).map(function(seg) {
        seg.component = component
        return seg
      })
    }

    return []
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  private rangeToSegs(range: DateRange): Seg[] {
    let colCnt = this.dayTable.colCnt

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
