import { findElements } from '@fullcalendar/core'
import { parseIsoAsUtc, formatIsoDay } from '../datelib-utils'
import { parseUtcDate } from '../date-parsing'
import CalendarWrapper from './CalendarWrapper'


export default class DayHeaderWrapper {

  constructor(public el: HTMLElement) {
  }


  getDates() {
    return this.getCellEls().map((cellEl) => {
      return parseIsoAsUtc(cellEl.getAttribute('data-date'))
    })
  }


  getCellEls() {
    return findElements(this.el, '.fc-col-header-cell')
  }


  getCellEl(dateOrDow) {
    if (typeof dateOrDow === 'number') {
      return this.el.querySelector(`.fc-col-header-cell.${CalendarWrapper.DOW_CLASSNAMES[dateOrDow]}`)
    } else {
      if (typeof dateOrDow === 'string') {
        dateOrDow = parseUtcDate(dateOrDow)
      }
      return this.el.querySelector(`.fc-col-header-cell[data-date="${formatIsoDay(dateOrDow)}"]`)
    }
  }


  getCellText(dateOrDow) {
    return $(this.getCellEl(dateOrDow)).text()
  }


  getCellInfo() { // all
    return this.getCellEls().map((cellEl) => ({
      text: $(cellEl).text(),
      date: parseIsoAsUtc(cellEl.getAttribute('data-date')),
      isToday: cellEl.classList.contains('fc-day-today')
    }))
  }


  getNavLinkEls() {
    return findElements(this.el, '.fc-col-header-cell[data-date] a[data-navlink]')
  }


  getNavLinkEl(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return this.el.querySelector('.fc-col-header-cell[data-date="' + formatIsoDay(dayDate) + '"] a')
  }


  clickNavLink(date) {
    $.simulateMouseClick(this.getNavLinkEl(date))
  }

}
