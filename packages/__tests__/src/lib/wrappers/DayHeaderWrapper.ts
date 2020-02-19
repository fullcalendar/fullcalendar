import { findElements } from '@fullcalendar/core'


export default class DayHeaderWrapper {

  constructor(public el: HTMLElement) {
  }


  getCellEls() {
    return findElements(this.el, '.fc-day-header')
  }


  getAxisEl() {
    return this.el.querySelector('.fc-axis')
  }

}
