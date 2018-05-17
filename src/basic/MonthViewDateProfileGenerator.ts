import BasicViewDateProfileGenerator from './BasicViewDateProfileGenerator'
import UnzonedRange from '../models/UnzonedRange'
import { diffWeeks } from '../datelib/env'
import { addWeeks } from '../datelib/util'


export default class MonthViewDateProfileGenerator extends BasicViewDateProfileGenerator {

  // Computes the date range that will be rendered.
  buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
    let renderUnzonedRange = super.buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay)
    let start = renderUnzonedRange.start
    let end = renderUnzonedRange.end
    let rowCnt

    // ensure 6 weeks
    if (this.opt('fixedWeekCount')) {
      rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
        diffWeeks(start, end)
      )
      end = addWeeks(end, 6 - rowCnt)
    }

    return new UnzonedRange(start, end)
  }

}
