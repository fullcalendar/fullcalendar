import { DateMarker, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { joinClassNames } from '../util/html'
import { createAriaClickAttrs } from '../util/dom-event'
import { formatWithOrdinals } from '../util/misc'
import { ViewContext } from '../ViewContext'
import classNames from '../styles.module.css'
import { FULL_DATE_FORMAT, WEEK_FORMAT } from '../util/date-format'

/*
TODO: just have this return the string?
*/
export function buildDateStr(
  context: ViewContext,
  dateMarker: DateMarker,
  viewType = 'day',
): string {
  return joinDateTimeFormatParts(
    context.dateEnv.formatToParts(dateMarker, viewType === 'week' ? WEEK_FORMAT : FULL_DATE_FORMAT),
  )
}

/*
Assumes navLinks enabled
Always hidden to screen readers. Do not point aria-labelledby at this. Use aria-label instead.
*/
export function buildNavLinkAttrs(
  context: ViewContext,
  dateMarker: DateMarker,
  viewType = 'day',
  dateStr = buildDateStr(context, dateMarker, viewType),
  isTabbable = true,
) {
  const { dateEnv, options, calendarApi } = context
  const zonedDate = dateEnv.toDate(dateMarker)

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
    'role': ('link' as any), // TODO
    'aria-label': formatWithOrdinals(options.navLinkHint, [dateStr, zonedDate], dateStr),
    'className': joinClassNames(
      options.navLinkClass,
      classNames.cursorPointer,
      classNames.internalNavLink,
    ),
    ...(isTabbable
      ? createAriaClickAttrs(handleInteraction)
      : { onClick: handleInteraction }
    ),
  }
}
