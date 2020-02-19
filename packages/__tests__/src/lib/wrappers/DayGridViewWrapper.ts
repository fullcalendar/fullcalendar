import { Calendar } from '@fullcalendar/core'
import ViewWrapper from './ViewWrapper'
import DayGridWrapper from './DayGridWrapper'
import DayHeaderWrapper from './DayHeaderWrapper'

export default class DayGridViewWrapper extends ViewWrapper {

  constructor(calendar: Calendar) {
    super(calendar, 'fc-dayGrid-view')
  }


  get header() {
    let headerEl = this.el.querySelector('.fc-head .fc-scroller > table') as HTMLElement
    return headerEl ? new DayHeaderWrapper(headerEl) : null
  }


  get dayGrid() {
    return new DayGridWrapper(this.el.querySelector('.fc-day-grid'))
  }


  getScrollerEl() {
    return this.el.querySelector('.scrollgrid .fc-body:last-child .fc-scroller')
  }

}
