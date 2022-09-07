import { DaySeriesModel } from './DaySeriesModel'
import { DateRange } from '../datelib/date-range'
import { DateMarker } from '../datelib/marker'
import { Seg } from '../component/DateComponent'
import { Dictionary } from '../options'

export interface DayTableSeg extends Seg {
  row: number
  firstCol: number
  lastCol: number
}

export interface DayTableCell {
  key: string // probably just the serialized date, but could be other metadata if this col is specific to another entity
  date: DateMarker
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
  extraDateSpan?: Dictionary
}

export class DayTableModel {
  rowCnt: number
  colCnt: number
  cells: DayTableCell[][]
  headerDates: DateMarker[]

  private daySeries: DaySeriesModel

  constructor(daySeries: DaySeriesModel, breakOnWeeks: boolean) {
    let { dates } = daySeries
    let daysPerRow
    let firstDay
    let rowCnt

    if (breakOnWeeks) {
      // count columns until the day-of-week repeats
      firstDay = dates[0].getUTCDay()
      for (daysPerRow = 1; daysPerRow < dates.length; daysPerRow += 1) {
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

    for (let row = 0; row < this.rowCnt; row += 1) {
      let cells = []

      for (let col = 0; col < this.colCnt; col += 1) {
        cells.push(
          this.buildCell(row, col),
        )
      }

      rows.push(cells)
    }

    return rows
  }

  private buildCell(row, col): DayTableCell {
    let date = this.daySeries.dates[row * this.colCnt + col]
    return {
      key: date.toISOString(),
      date,
    }
  }

  private buildHeaderDates() {
    let dates = []

    for (let col = 0; col < this.colCnt; col += 1) {
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
          isEnd: seriesSeg.isEnd && (nextIndex - 1) === lastIndex,
        })

        index = nextIndex
      }
    }

    return segs
  }
}
