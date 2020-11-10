import { Calendar } from '@fullcalendar/core'
import { ViewWrapper } from './ViewWrapper'
import { DayGridWrapper } from './DayGridWrapper'
import { DayHeaderWrapper } from './DayHeaderWrapper'

export class DayGridViewWrapper extends ViewWrapper {
  constructor(calendar: Calendar) {
    super(calendar, 'fc-daygrid')
  }

  get header() {
    let headerEl = this.el.querySelector('.fc-col-header') as HTMLElement
    return headerEl ? new DayHeaderWrapper(headerEl) : null
  }

  get dayGrid() {
    return new DayGridWrapper(this.el.querySelector('.fc-daygrid-body'))
  }

  getScrollerEl() {
    return this.el.querySelector('.fc-daygrid-body').parentElement // TODO: use closest
  }
}
