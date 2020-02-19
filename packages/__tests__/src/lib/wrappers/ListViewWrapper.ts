import ViewWrapper from './ViewWrapper'
import { Calendar, findElements } from '@fullcalendar/core'


export default class ListViewWrapper extends ViewWrapper {

  static EVENT_DOT_CLASSNAME = 'fc-event-dot'


  constructor(calendar: Calendar) {
    super(calendar, 'fc-list-view')
  }


  getEventEls() {
    return findElements(this.el, '.fc-list-item')
  }


  getEventInfo() {
    return this.getEventEls().map((eventEl) => {
      return {
        title: $(eventEl).find('.fc-list-item-title').text(),
        timeText: $(eventEl).find('.fc-list-item-time').text()
      }
    })
  }


  getDayInfo() {
    return this.getHeadingEls().map(function(el) {
      let $el = $(el)
      return {
        mainText: $el.find('.fc-list-heading-main').text() || '',
        altText: $el.find('.fc-list-heading-alt').text() || '',
        date: new Date(el.getAttribute('data-date'))
      }
    })
  }


  getHeadingEls() {
    return findElements(this.el, '.fc-list-heading')
  }


  getScrollerEl() {
    return this.el.querySelector('.fc-scroller')
  }


  hasEmptyMessage() {
    return Boolean(this.el.querySelector('.fc-list-empty'))
  }

}
