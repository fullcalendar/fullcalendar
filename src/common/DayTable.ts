import DaySeries from './DaySeries'
import { DateRange } from '../datelib/date-range'

export interface DayTableSeg {
  row: number
  firstCol: number
  lastCol: number
  isStart: boolean
  isEnd: boolean
}

export default class DayTable {

  rowCnt: number
  colCnt: number
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
  }

  getDate(row: number, col: number) {
    return this.daySeries.dates[row * this.colCnt + col]
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
