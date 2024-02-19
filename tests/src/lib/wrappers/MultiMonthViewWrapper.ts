import { Calendar } from '@fullcalendar/core'
import { findElements } from '@fullcalendar/core/internal'
import { ViewWrapper } from './ViewWrapper.js'
import { DayGridWrapper } from './DayGridWrapper.js'

export class MultiMonthViewWrapper extends ViewWrapper {
  constructor(calendar: Calendar) {
    super(calendar, 'fc-multimonth')
  }

  getMonths() {
    const monthEls = findElements(this.el, '.fc-multimonth-month')

    return monthEls.map((monthEl) => ({
      el: monthEl,
      title: (monthEl.querySelector('.fc-multimonth-title') as HTMLElement).innerText,
      columnCnt: monthEl.querySelectorAll('th').length,
    }))
  }

  getDayGrid(i) {
    const dayGridEls = findElements(this.el, '.fc-multimonth-daygrid')
    return new DayGridWrapper(dayGridEls[i])
  }

  getEventEls() { // FG events
    return findElements(this.el, '.fc-daygrid-event')
  }

  getScrollerEl() {
    return this.el // the view itself
  }
}
