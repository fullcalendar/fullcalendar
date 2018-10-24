import BasicViewDateProfileGenerator from './BasicViewDateProfileGenerator'
import { addWeeks, diffWeeks } from '../datelib/marker'


export default class MonthViewDateProfileGenerator extends BasicViewDateProfileGenerator {

  // Computes the date range that will be rendered.
  buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay) {
    let renderRange = super.buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay)
    let start = renderRange.start
    let end = renderRange.end
    let rowCnt

    // ensure 6 weeks
    if (this.options.fixedWeekCount) {
      rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
        diffWeeks(start, end)
      )
      end = addWeeks(end, 6 - rowCnt)
    }

    return { start, end }
  }

}
