import { createFormatter } from '../datelib/formatting'
import { DateMarker } from '../datelib/marker'
import { createAriaClickHandlers } from '../util/dom-event'
import { formatWithOrdinals } from '../util/misc'
import { ViewContext } from '../ViewContext'

const DAY_FORMAT = createFormatter({ year: 'numeric', month: 'long', day: 'numeric' })
const WEEK_FORMAT = createFormatter({ week: 'long' })

export function buildNavLinkAttrs(context: ViewContext, dateMarker: DateMarker, viewType = 'day') {
  const { dateEnv, options, calendarApi } = context
  let dateStr = dateEnv.format(dateMarker, viewType === 'week' ? WEEK_FORMAT : DAY_FORMAT)

  if (options.navLinks) {
    let zonedDate = dateEnv.toDate(dateMarker)
    return {
      title: formatWithOrdinals(options.navLinkTitle, [dateStr, zonedDate], dateStr),
      'data-navlink': '', // for legacy selectors. TODO: use className?
      ...createAriaClickHandlers((ev: UIEvent) => {
        let customAction =
          viewType === 'day' ? options.navLinkDayClick :
          viewType === 'week' ? options.navLinkWeekClick : null

        if (typeof customAction === 'function') {
          customAction.call(calendarApi, dateEnv.toDate(dateMarker), ev)
        } else {
          if (typeof customAction === 'string') {
            viewType = customAction
          }
          calendarApi.zoomTo(dateMarker, viewType)
        }
      })
    }
  }

  return { 'aria-label': dateStr }
}
