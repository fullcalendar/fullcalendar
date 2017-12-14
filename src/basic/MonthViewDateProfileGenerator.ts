import BasicViewDateProfileGenerator from './BasicViewDateProfileGenerator'
import UnzonedRange from '../models/UnzonedRange'


export default class MonthViewDateProfileGenerator extends BasicViewDateProfileGenerator {

  // Computes the date range that will be rendered.
  buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
    let renderUnzonedRange = super.buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay)
    let start = this.msToUtcMoment(renderUnzonedRange.startMs, isRangeAllDay)
    let end = this.msToUtcMoment(renderUnzonedRange.endMs, isRangeAllDay)
    let rowCnt

    // ensure 6 weeks
    if (this.opt('fixedWeekCount')) {
      rowCnt = Math.ceil( // could be partial weeks due to hiddenDays
        end.diff(start, 'weeks', true) // dontRound=true
      )
      end.add(6 - rowCnt, 'weeks')
    }

    return new UnzonedRange(start, end)
  }

}
