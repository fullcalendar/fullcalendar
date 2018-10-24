import DateProfileGenerator from '../DateProfileGenerator'
import { addWeeks } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'


export default class BasicViewDateProfileGenerator extends DateProfileGenerator {

  // Computes the date range that will be rendered.
  buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay): DateRange {
    let { dateEnv } = this
    let renderRange = super.buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay)
    let start = renderRange.start
    let end = renderRange.end
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

    return { start, end }
  }

}
