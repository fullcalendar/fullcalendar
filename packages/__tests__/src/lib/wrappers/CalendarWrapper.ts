import { Calendar, findElements } from '@fullcalendar/core'
import ToolbarWrapper from './ToolbarWrapper'

export default class CalendarWrapper {

  static EVENT_CLASSNAME = 'fc-event' // TODO: put this everywhere?
  static EVENT_IS_START_CLASSNAME = 'fc-start'
  static EVENT_IS_END_CLASSNAME = 'fc-end'
  static EVENT_TIME_CLASSNAME = 'fc-time'
  static EVENT_TITLE_CLASSNAME = 'fc-title'
  static EVENT_RESIZER_CLASSNAME = 'fc-resizer'
  static EVENT_START_RESIZER_CLASSNAME = 'fc-start-resizer'
  static EVENT_END_RESIZER_CLASSNAME = 'fc-end-resizer'
  static BG_EVENT_CLASSNAME = 'fc-bgevent'
  static TODAY_CLASSNAME = 'fc-today'
  static PAST_CLASSNAME = 'fc-past'
  static FUTURE_CLASSNAME = 'fc-future'
  static DOW_CLASSNAMES = [ 'fc-sun', 'fc-mon', 'fc-tue', 'fc-wed', 'fc-thu', 'fc-fri', 'fc-sat' ]


  constructor(private calendar: Calendar) {
  }


  // TODO: distinguish between header/footer
  get toolbar() {
    let toolbarEl = this.calendar.el.querySelector('.fc-toolbar') as HTMLElement
    return toolbarEl ? new ToolbarWrapper(toolbarEl) : null
  }


  getViewContainerEl() {
    return this.calendar.el.querySelector('.fc-view-container')
  }


  // DISCOURAGE use of the following...


  getNonBusinessDayEls() {
    return findElements(this.calendar.el, '.fc-nonbusiness')
  }


  getEventEls() { // FG only
    return findElements(this.calendar.el, '.fc-event')
  }


  getFirstEventEl() {
    return this.calendar.el.querySelector('.fc-event') as HTMLElement
  }


  getEventElInfo(eventEl: HTMLElement) {
    return {
      isStart: eventEl.classList.contains('fc-start'),
      isEnd: eventEl.classList.contains('fc-end'),
      timeText: $(eventEl).find('.' + CalendarWrapper.EVENT_TIME_CLASSNAME).text() || '',
      titleEl: eventEl.querySelector('.fc-title'),
      resizerEl: eventEl.querySelector('.fc-resizer')
    }
  }


  getBgEventEls() {
    return findElements(this.calendar.el, '.' + CalendarWrapper.BG_EVENT_CLASSNAME)
  }


  getFirstDateEl() {
    return this.calendar.el.querySelector('.fc [data-date]')
  }


  getDateCellEl(dateStr: string) {
    return this.calendar.el.querySelector('td.fc-day[data-date="' + dateStr + '"]')
  }


  hasLicenseMessage() {
    return $('.fc-license-message', this.calendar.el).is(':visible')
  }


}
