import { findElements } from '../../lib/dom-misc'
import { parseIsoAsUtc, formatIsoDay } from '../datelib-utils'
import { parseUtcDate } from '../date-parsing'
import { CalendarWrapper } from './CalendarWrapper'

export class DayHeaderWrapper {
  constructor(public el: HTMLElement) {
  }

  getDates() {
    return this.getCellEls().map((cellEl) => parseIsoAsUtc(cellEl.getAttribute('data-date')))
  }

  getCellEls() {
    return findElements(this.el, '[role=columnheader]')
  }

  getCellEl(dateOrDow) {
    if (typeof dateOrDow === 'number') {
      return this.el.querySelector(`[role=columnheader].${CalendarWrapper.DOW_CLASSNAMES[dateOrDow]}`)
    }
    if (typeof dateOrDow === 'string') {
      dateOrDow = parseUtcDate(dateOrDow)
    }
    return this.el.querySelector(`[role=columnheader][data-date="${formatIsoDay(dateOrDow)}"]`)
  }

  getCellText(dateOrDow) {
    return $(this.getCellEl(dateOrDow)).text()
  }

  getCellInfo() { // all
    return this.getCellEls().map((cellEl) => ({
      text: $(cellEl).text(),
      date: parseIsoAsUtc(cellEl.getAttribute('data-date')),
      isToday: cellEl.classList.contains('fc-day-today'),
    }))
  }

  getNavLinkEls() {
    return findElements(this.el, '[role=columnheader][data-date] .fc-navlink')
  }

  getNavLinkEl(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return this.el.querySelector('[role=columnheader][data-date="' + formatIsoDay(dayDate) + '"] .fc-navlink')
  }

  clickNavLink(date) {
    $.simulateMouseClick(this.getNavLinkEl(date))
  }
}
