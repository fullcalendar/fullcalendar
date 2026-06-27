import { Calendar } from 'fullcalendar'
import internalClassNames from 'fullcalendar/protected-styles'
import { findElements } from '../../lib/dom-misc'
import { ViewWrapper } from './ViewWrapper'
import { DayGridWrapper } from './DayGridWrapper'

export class MultiMonthViewWrapper extends ViewWrapper {
  constructor(calendar: Calendar) {
    super(calendar, 'fc-multimonth')
  }

  getMonths() {
    const monthEls = findElements(this.el, '.fc-multimonth-month')

    return monthEls.map((monthEl) => ({
      el: monthEl,
      title: (monthEl.querySelector('.fc-multimonth-title') as HTMLElement).innerText,
      columnCnt: monthEl.querySelectorAll('.fc-multimonth-header-row [role=columnheader]').length,
    }))
  }

  getDayGrid(i) {
    const dayGridEls = findElements(this.el, '.fc-multimonth-month')
    return new DayGridWrapper(dayGridEls[i])
  }

  getEventEls() { // FG events
    return findElements(this.el, '.fc-daygrid-event')
  }

  getScrollerEl() {
    return this.el.querySelector(`.${internalClassNames.internalScroller}`)
  }
}
