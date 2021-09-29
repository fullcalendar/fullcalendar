import { createFormatter } from '../datelib/formatting'
import { formatDayString } from '../datelib/formatting-utils'
import { DateMarker } from '../datelib/marker'
import { ViewContext } from '../ViewContext'

const DAY_FORMAT = createFormatter({ year: 'numeric', month: 'long', day: 'numeric' })
const WEEK_FORMAT = createFormatter({ week: 'long' })

export function buildNavLinkAttrs(context: ViewContext, date: DateMarker, type = 'day') {
  if (context.options.navLinks) {
    return {
      title: context.dateEnv.format(date, type === 'week' ? WEEK_FORMAT : DAY_FORMAT),
      'data-navlink': buildNavLinkData(date, type),
      tabIndex: 0,
    }
  }
  return {}
}

function buildNavLinkData(date: DateMarker, type: string) {
  return JSON.stringify({
    date: formatDayString(date),
    type,
  })
}
