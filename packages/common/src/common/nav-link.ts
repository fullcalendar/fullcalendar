import { createFormatter } from '../datelib/formatting'
import { formatDayString } from '../datelib/formatting-utils'
import { DateMarker } from '../datelib/marker'
import { formatWithOrdinals } from '../util/misc'
import { ViewContext } from '../ViewContext'

const DAY_FORMAT = createFormatter({ year: 'numeric', month: 'long', day: 'numeric' })
const WEEK_FORMAT = createFormatter({ week: 'long' })

export function buildNavLinkAttrs(context: ViewContext, date: DateMarker, type = 'day') {
  const { dateEnv, options } = context
  let dateStr = dateEnv.format(date, type === 'week' ? WEEK_FORMAT : DAY_FORMAT)

  if (options.navLinks) {
    let zonedDate = dateEnv.toDate(date)

    return {
      title: formatWithOrdinals(options.navLinkTitle, [dateStr, zonedDate], dateStr),
      'data-navlink': buildNavLinkData(date, type),
      tabIndex: 0,
    }
  }

  return {
    'aria-label': dateStr,
  }
}

function buildNavLinkData(date: DateMarker, type: string) {
  return JSON.stringify({
    date: formatDayString(date),
    type,
  })
}
