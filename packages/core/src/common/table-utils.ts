import { createFormatter } from '../datelib/formatting.js'
import { DateFormatter } from '../datelib/DateFormatter.js'

// Computes a default column header formatting string if `colFormat` is not explicitly defined
export function computeFallbackHeaderFormat(datesRepDistinctDays: boolean, dayCnt: number): DateFormatter {
  // if more than one week row, or if there are a lot of columns with not much space,
  // put just the day numbers will be in each cell
  if (!datesRepDistinctDays || dayCnt > 10) {
    return createFormatter({ weekday: 'short' }) // "Sat"
  }

  if (dayCnt > 1) {
    return createFormatter({ weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }) // "Sat 11/12"
  }

  return createFormatter({ weekday: 'long' }) // "Saturday"
}
