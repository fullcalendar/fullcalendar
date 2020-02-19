import ViewWrapper from './ViewWrapper'
import TimeGridWrapper from './TimeGridWrapper'
import DayGridWrapper from './DayGridWrapper'

export default class TimeGridViewWrapper extends ViewWrapper {

  constructor(calendar) {
    super(calendar, 'fc-timeGrid-view')
  }


  get timeGrid() {
    return new TimeGridWrapper(this.el.querySelector('.fc-time-grid'))
  }


  get dayGrid() { // the all-day area
    let dayGridEl = this.el.querySelector('.fc-day-grid') as HTMLElement
    return dayGridEl ? new DayGridWrapper(dayGridEl) : null
  }


  getScrollerEl() {
    return this.el.querySelector('.scrollgrid .fc-body:last-child .fc-scroller')
  }

}
