import ViewWrapper from './ViewWrapper'
import TimeGridWrapper from './TimeGridWrapper'
import DayGridWrapper from './DayGridWrapper'
import DayHeaderWrapper from './DayHeaderWrapper'

export default class TimeGridViewWrapper extends ViewWrapper {

  constructor(calendar) {
    super(calendar, 'fc-timegrid')
  }


  get header() {
    let headerEl = this.el.querySelector('.fc-col-header') as HTMLElement
    return headerEl ? new DayHeaderWrapper(headerEl) : null
  }


  get timeGrid() {
    return new TimeGridWrapper(this.el.querySelector('.fc-timegrid-body'))
  }


  get dayGrid() { // the all-day area
    let dayGridEl = this.el.querySelector('.fc-daygrid-body') as HTMLElement
    return dayGridEl ? new DayGridWrapper(dayGridEl) : null
  }


  getScrollerEl() {
    return this.el.querySelector('.fc-daygrid-body').parentElement // TODO: use closest
  }


  getAllDayAxisEl() {
    return this.el.querySelector('.fc-day-grid > .fc-row > .fc-bg .fc-axis')
  }


  getAllDayAxisElText() {
    return $(this.getAllDayAxisEl()).text()
  }

}
