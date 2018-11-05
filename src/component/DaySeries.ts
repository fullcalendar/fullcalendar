import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { DateMarker, addDays, diffDays } from '../datelib/marker'

export default class DaySeries {

  dates: DateMarker[] // whole-day dates for each column. left to right
  indices: number[] // for each day from start, the offset

  constructor(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
    let date: DateMarker = dateProfile.renderRange.start
    let end: DateMarker = dateProfile.renderRange.end
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
  }

  // Given a date, returns its chronolocial cell-index from the first cell of the grid.
  // If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
  // If before the first offset, returns a negative number.
  // If after the last offset, returns an offset past the last cell offset.
  // Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
  getDateDayIndex(date: DateMarker) {
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
