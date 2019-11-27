import { DateMarker, startOfDay, addDays, DAY_IDS } from '../datelib/marker'
import { rangeContainsMarker } from '../datelib/date-range'
import ComponentContext from '../component/ComponentContext'
import { DateProfile } from '../DateProfileGenerator'


// Computes HTML classNames for a single-day element
export function getDayClasses(date: DateMarker, dateProfile: DateProfile, context: ComponentContext, noThemeHighlight?) {
  let { calendar, options, theme, dateEnv } = context
  let classes = []
  let todayStart: DateMarker
  let todayEnd: DateMarker

  if (!rangeContainsMarker(dateProfile.activeRange, date)) {
    classes.push('fc-disabled-day')
  } else {
    classes.push('fc-' + DAY_IDS[date.getUTCDay()])

    if (
      options.monthMode &&
      dateEnv.getMonth(date) !== dateEnv.getMonth(dateProfile.currentRange.start)
    ) {
      classes.push('fc-other-month')
    }

    todayStart = startOfDay(calendar.getNow())
    todayEnd = addDays(todayStart, 1)

    if (date < todayStart) {
      classes.push('fc-past')
    } else if (date >= todayEnd) {
      classes.push('fc-future')
    } else {
      classes.push('fc-today')

      if (noThemeHighlight !== true) {
        classes.push(theme.getClass('today'))
      }
    }
  }

  return classes
}
