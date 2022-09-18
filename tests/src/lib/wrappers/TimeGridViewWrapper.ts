import { ViewWrapper } from './ViewWrapper.js'
import { TimeGridWrapper } from './TimeGridWrapper.js'
import { DayGridWrapper } from './DayGridWrapper.js'
import { DayHeaderWrapper } from './DayHeaderWrapper.js'

export class TimeGridViewWrapper extends ViewWrapper {
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
    return this.el.querySelector('.fc-timegrid-body').parentElement // TODO: use closest
  }

  getHeaderAxisEl() {
    return this.el.querySelector('.fc-col-header .fc-timegrid-axis')
  }

  getHeaderWeekNumberLink() {
    return this.getHeaderAxisEl().querySelector('a')
  }

  getHeaderWeekText() { // the title
    return $(this.getHeaderWeekNumberLink()).text()
  }

  getAllDayAxisEl() {
    return this.el.querySelector('.fc-daygrid-body .fc-timegrid-axis')
  }

  getAllDayAxisElText() {
    return $(this.getAllDayAxisEl()).text()
  }
}
