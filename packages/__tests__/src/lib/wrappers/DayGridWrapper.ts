import { findElements } from '@fullcalendar/core'
import { formatIsoDay } from '../datelib-utils'

export default class DayGridWrapper {

  constructor(private el: HTMLElement) {
  }

  // TODO: discourage use
  getDayEls(date) {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return findElements(this.el, '.fc-day[data-date="' + formatIsoDay(date) + '"]')
  }

  // TODO: discourage use
  getNonBusinessDayEls() {
    return findElements(this.el, '.fc-nonbusiness')
  }

  // TODO: discourage use
  getDowEls(dayAbbrev) {
    return findElements(this.el, `.fc-row:first-child td.fc-day.fc-${dayAbbrev}`)
  }

}
