import { findElements } from '@fullcalendar/core'
import { parseIsoAsUtc } from '../datelib-utils'


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


  getAxisEl() {
    return this.el.querySelector('.fc-axis')
  }


  getWeekNumberEl() {
    return this.el.querySelector('.fc-week-number')
  }


  getWeekNumberTitle() {
    return $(this.getWeekNumberEl()).text()
  }

}
