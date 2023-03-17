import { Calendar } from '@fullcalendar/core'
import { findElements } from '@fullcalendar/core/internal'
import { ViewWrapper } from './ViewWrapper.js'
import { formatIsoDay } from '../datelib-utils.js'

export class ListViewWrapper extends ViewWrapper {
  static EVENT_DOT_CLASSNAME = 'fc-list-event-dot'

  constructor(calendar: Calendar) {
    super(calendar, 'fc-list')
  }

  getEventEls() {
    return findElements(this.el, '.fc-list-event')
  }

  getEventInfo() {
    return this.getEventEls().map((eventEl) => ({
      title: $(eventEl).find('.fc-list-event-title').text(),
      timeText: $(eventEl).find('.fc-list-event-time').text(),
    }))
  }

  getDayInfo() {
    return this.getHeadingEls().map((el) => {
      let $el = $(el)
      return {
        mainText: $el.find('.fc-list-day-text').text() || '',
        altText: $el.find('.fc-list-day-side-text').text() || '',
        date: new Date(el.getAttribute('data-date')),
      }
    })
  }

  getHeadingEls() {
    return findElements(this.el, '.fc-list-day')
  }

  getScrollerEl() {
    return this.el.querySelector('.fc-scroller')
  }

  hasEmptyMessage() {
    return Boolean(this.el.querySelector('.fc-list-empty'))
  }

  getNavLinkEl(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return this.el.querySelector('.fc-list-day[data-date="' + formatIsoDay(dayDate) + '"] a.fc-list-day-text')
  }

  clickNavLink(dayDate) {
    $.simulateMouseClick(this.getNavLinkEl(dayDate))
  }
}
