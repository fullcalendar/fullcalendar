import UnzonedRange from '../models/UnzonedRange'
import DateProfileGenerator from '../DateProfileGenerator'
import { addWeeks } from '../datelib/marker'


export default class BasicViewDateProfileGenerator extends DateProfileGenerator {

  // Computes the date range that will be rendered.
  buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
    const dateEnv = this._view.calendar.dateEnv
    let renderUnzonedRange = super.buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay) // an UnzonedRange
    let start = renderUnzonedRange.start
    let end = renderUnzonedRange.end
    let endOfWeek

    // year and month views should be aligned with weeks. this is already done for week
    if (/^(year|month)$/.test(currentRangeUnit)) {
      start = dateEnv.startOfWeek(start)

      // make end-of-week if not already
      endOfWeek = dateEnv.startOfWeek(end)
      if (endOfWeek.valueOf() !== end.valueOf()) {
        end = addWeeks(endOfWeek, 1)
      }
    }

    return new UnzonedRange(start, end)
  }

}
