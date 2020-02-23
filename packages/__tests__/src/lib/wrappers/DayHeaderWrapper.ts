import { findElements } from '@fullcalendar/core'
import { parseIsoAsUtc, formatIsoDay } from '../datelib-utils'
import { parseUtcDate } from '../date-parsing'
import CalendarWrapper from './CalendarWrapper'


export default class DayHeaderWrapper {

  static DOW_CLASSNAMES = [ 'fc-sun', 'fc-mon', 'fc-tue', 'fc-wed', 'fc-thu', 'fc-fri', 'fc-sat' ]


  constructor(public el: HTMLElement) {
  }


  getDates() {
    return this.getCellEls().map((cellEl) => {
      return parseIsoAsUtc(cellEl.getAttribute('data-date'))
    })
  }


  getCellEls() {
    return findElements(this.el, '.fc-day-header')
  }


  getCellEl(dateOrDow) {
    if (typeof dateOrDow === 'number') {
      return this.el.querySelector(`.fc-day-header.${CalendarWrapper.DOW_CLASSNAMES[dateOrDow]}`)
    } else {
      if (typeof dateOrDow === 'string') {
        dateOrDow = parseUtcDate(dateOrDow)
      }
      return this.el.querySelector(`.fc-day-header[data-date="${formatIsoDay(dateOrDow)}"]`)
    }
  }


  getCellText(dateOrDow) {
    return $(this.getCellEl(dateOrDow)).text()
  }


  getAxisEl() {
    return this.el.querySelector('.fc-axis')
  }


  getAxisText() { // not used?
    return $(this.getAxisEl()).text()
  }


  getWeekNumberEl() {
    return this.el.querySelector('.fc-week-number')
  }


  getWeekNavLinkEl() {
    return this.el.querySelector('.fc-week-number a')
  }


  getWeekNumberTitle() {
    return $(this.getWeekNumberEl()).text()
  }


  getNavLinkEls() {
    return findElements(this.el, '.fc-day-header[data-date] a')
  }


  getNavLinkEl(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return this.el.querySelector('.fc-day-header[data-date="' + formatIsoDay(dayDate) + '"] a')
  }


  clickNavLink(date) {
    $.simulateMouseClick(this.getNavLinkEl(date))
  }

}
