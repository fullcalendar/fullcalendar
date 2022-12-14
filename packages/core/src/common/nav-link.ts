import { createFormatter } from '../datelib/formatting.js'
import { DateMarker } from '../datelib/marker.js'
import { createAriaClickAttrs } from '../util/dom-event.js'
import { formatWithOrdinals } from '../util/misc.js'
import { ViewContext } from '../ViewContext.js'

const DAY_FORMAT = createFormatter({ year: 'numeric', month: 'long', day: 'numeric' })
const WEEK_FORMAT = createFormatter({ week: 'long' })

export function buildNavLinkAttrs(
  context: ViewContext,
  dateMarker: DateMarker,
  viewType = 'day',
  isTabbable = true,
) {
  const { dateEnv, options, calendarApi } = context
  let dateStr = dateEnv.format(dateMarker, viewType === 'week' ? WEEK_FORMAT : DAY_FORMAT)

  if (options.navLinks) {
    let zonedDate = dateEnv.toDate(dateMarker)

    const handleInteraction = (ev: UIEvent) => {
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
    }

    return {
      title: formatWithOrdinals(options.navLinkHint, [dateStr, zonedDate], dateStr),
      'data-navlink': '', // for legacy selectors. TODO: use className?
      ...(isTabbable
        ? createAriaClickAttrs(handleInteraction)
        : { onClick: handleInteraction }
      ),
    }
  }

  return { 'aria-label': dateStr }
}
