import DaySeries from './DaySeries'
import { DateRange } from '../datelib/date-range'
import { DateMarker } from '../datelib/marker'
import { Seg } from '../component/DateComponent'

export interface DayTableSeg extends Seg {
  row: number
  firstCol: number
  lastCol: number
}

export interface DayTableCell {
  date: DateMarker
  htmlAttrs?: string
}

export default class DayTable {

  rowCnt: number
  colCnt: number
  cells: DayTableCell[][]
  headerDates: DateMarker[]

  private daySeries: DaySeries

  constructor(daySeries: DaySeries, breakOnWeeks: boolean) {
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

    this.rowCnt = rowCnt
    this.colCnt = daysPerRow
    this.daySeries = daySeries
    this.cells = this.buildCells()
    this.headerDates = this.buildHeaderDates()
  }

  private buildCells() {
    let rows = []

    for (let row = 0; row < this.rowCnt; row++) {
      let cells = []

      for (let col = 0; col < this.colCnt; col++) {
        cells.push(
          this.buildCell(row, col)
        )
      }

      rows.push(cells)
    }

    return rows
  }

  private buildCell(row, col) {
    return {
      date: this.daySeries.dates[row * this.colCnt + col]
    }
  }

  private buildHeaderDates() {
    let dates = []

    for (let col = 0; col < this.colCnt; col++) {
      dates.push(this.cells[0][col].date)
    }

    return dates
  }

  sliceRange(range: DateRange): DayTableSeg[] {
    let { colCnt } = this
    let seriesSeg = this.daySeries.sliceRange(range)
    let segs: DayTableSeg[] = []

    if (seriesSeg) {
      let { firstIndex, lastIndex } = seriesSeg
      let index = firstIndex

      while (index <= lastIndex) {
        let row = Math.floor(index / colCnt)
        let nextIndex = Math.min((row + 1) * colCnt, lastIndex + 1)

        segs.push({
          row,
          firstCol: index % colCnt,
          lastCol: (nextIndex - 1) % colCnt,
          isStart: seriesSeg.isStart && index === firstIndex,
          isEnd: seriesSeg.isEnd && (nextIndex - 1) === lastIndex
        })

        index = nextIndex
      }
    }

    return segs
  }

}
