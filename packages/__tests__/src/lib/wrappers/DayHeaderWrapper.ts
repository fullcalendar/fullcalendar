import { findElements } from '@fullcalendar/core'


export default class DayHeaderWrapper {

  static DOW_CLASSNAMES = [ 'fc-sun', 'fc-mon', 'fc-tue', 'fc-wed', 'fc-thu', 'fc-fri', 'fc-sat' ]


  constructor(public el: HTMLElement) {
  }


  getCellEls() {
    return findElements(this.el, '.fc-day-header')
  }


  getAxisEl() {
    return this.el.querySelector('.fc-axis')
  }

}
