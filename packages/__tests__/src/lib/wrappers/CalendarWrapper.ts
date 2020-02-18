import { Calendar, findElements } from '@fullcalendar/core'
import ToolbarWrapper from './ToolbarWrapper'

export default class CalendarWrapper {

  constructor(private calendar: Calendar) {
  }

  // TODO: distinguish between header/footer
  get toolbar() {
    let toolbarEl = this.calendar.el.querySelector('.fc-toolbar') as HTMLElement
    return toolbarEl ? new ToolbarWrapper(toolbarEl) : null
  }

  // TODO: discourage use
  getNonBusinessDayEls() {
    return findElements(this.calendar.el, '.fc-nonbusiness')
  }

  // TODO: discourage use
  getFirstEventEl() {
    return this.calendar.el.querySelector('.fc-event') as HTMLElement
  }

}
