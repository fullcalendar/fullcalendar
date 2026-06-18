import internalClassNames from 'fullcalendar/protected-styles'
import { ViewWrapper } from './ViewWrapper'
import { TimeGridWrapper } from './TimeGridWrapper'
import { DayGridWrapper } from './DayGridWrapper'
import { DayHeaderWrapper } from './DayHeaderWrapper'
import { findElements } from '../dom-misc'

export class TimeGridViewWrapper extends ViewWrapper {
  constructor(calendar) {
    super(calendar, 'fc-timegrid')
  }

  get header() {
    let headerEl = this.el.querySelector('.fc-timegrid-header') as HTMLElement
    return headerEl ? new DayHeaderWrapper(headerEl) : null
  }

  get timeGrid() {
    return new TimeGridWrapper(this.getScrollerEl())
  }

  // TODO: rename to allDaySection()
  // TODO: only consider the row (not all-day-header) part of the "daygrid"?
  get dayGrid() {
    let allDayHeaderEl = this.el.querySelector('.fc-timegrid-allday-header') as HTMLElement
    return allDayHeaderEl ? new DayGridWrapper(allDayHeaderEl.parentElement) : null
  }

  getScrollerEl(): HTMLElement {
    return this.el.querySelector(`.fc-timegrid-body .${internalClassNames.internalScroller}`)
  }

  getHeaderAxisEl() {
    return this.el.querySelector('.fc-timegrid-header [role=row] > *:first-child')
  }

  getHeaderWeekNumberLink() {
    return this.getHeaderAxisEl().querySelector('[role=link]')
  }

  getHeaderWeekText() { // the title
    return $(this.getHeaderAxisEl()).text()
  }

  getAllDayAxisEl() {
    return this.el.querySelector('.fc-timegrid-allday-header.fc-timegrid-axis')
  }

  getAllDayAxisElText() {
    return $(this.getAllDayAxisEl()).text()
  }

  /*
  TODO: DRY with ResourceTimeGridViewWrapper
  */
  getHeaderRowsGroupByRowIndex() {
    const rowEls = findElements(this.el, '.fc-timegrid-header [role=row][aria-rowindex]')
    const byRowIndex = {}

    for (const rowEl of rowEls) {
      const rowIndex = rowEl.getAttribute('aria-rowindex')

      if (!byRowIndex[rowIndex]) {
        byRowIndex[rowIndex] = []
      }

      byRowIndex[rowIndex].push(rowEl)
    }

    return byRowIndex
  }
}
