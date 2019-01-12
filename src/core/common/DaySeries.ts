import DateProfileGenerator from '../DateProfileGenerator'
import { DateMarker, addDays, diffDays } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'

export interface DaySeriesSeg {
  firstIndex: number
  lastIndex: number
  isStart: boolean
  isEnd: boolean
}

export default class DaySeries {

  cnt: number
  dates: DateMarker[] // whole-day dates for each column. left to right
  indices: number[] // for each day from start, the offset

  constructor(range: DateRange, dateProfileGenerator: DateProfileGenerator) {
    let date: DateMarker = range.start
    let end: DateMarker = range.end
    let indices: number[] = []
    let dates: DateMarker[] = []
    let dayIndex = -1

    while (date < end) { // loop each day from start to end
      if (dateProfileGenerator.isHiddenDay(date)) {
        indices.push(dayIndex + 0.5) // mark that it's between indices
      } else {
        dayIndex++
        indices.push(dayIndex)
        dates.push(date)
      }
      date = addDays(date, 1)
    }

    this.dates = dates
    this.indices = indices
    this.cnt = dates.length
  }

  sliceRange(range: DateRange): DaySeriesSeg | null {
    let firstIndex = this.getDateDayIndex(range.start) // inclusive first index
    let lastIndex = this.getDateDayIndex(addDays(range.end, -1)) // inclusive last index

    let clippedFirstIndex = Math.max(0, firstIndex)
    let clippedLastIndex = Math.min(this.cnt - 1, lastIndex)

    // deal with in-between indices
    clippedFirstIndex = Math.ceil(clippedFirstIndex) // in-between starts round to next cell
    clippedLastIndex = Math.floor(clippedLastIndex) // in-between ends round to prev cell

    if (clippedFirstIndex <= clippedLastIndex) {
      return {
        firstIndex: clippedFirstIndex,
        lastIndex: clippedLastIndex,
        isStart: firstIndex === clippedFirstIndex,
        isEnd: lastIndex === clippedLastIndex
      }
    } else {
      return null
    }
  }

  // Given a date, returns its chronolocial cell-index from the first cell of the grid.
  // If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
  // If before the first offset, returns a negative number.
  // If after the last offset, returns an offset past the last cell offset.
  // Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
  private getDateDayIndex(date: DateMarker) {
    let indices = this.indices
    let dayOffset = Math.floor(diffDays(this.dates[0], date))

    if (dayOffset < 0) {
      return indices[0] - 1
    } else if (dayOffset >= indices.length) {
      return indices[indices.length - 1] + 1
    } else {
      return indices[dayOffset]
    }
  }

}
