import { findElements } from '@fullcalendar/core/internal'
import { formatIsoDay } from '../datelib-utils.js'
import { getRectCenter, intersectRects, addPoints, subtractPoints } from '../geom.js'
import { CalendarWrapper } from './CalendarWrapper.js'

export class DayGridWrapper {
  static EVENT_IS_START_CLASSNAME = 'fc-event-start'
  static EVENT_IS_END_CLASSNAME = 'fc-event-end'

  constructor(private el: HTMLElement) {
  }

  getRootTableEl() {
    return $(this.el).find('> table')[0] as HTMLElement
  }

  getAllDayEls() {
    return findElements(this.el, '.fc-day[data-date]')
  }

  getMirrorEls() {
    return findElements(this.el, '.fc-event.fc-event-mirror')
  }

  getDayEl(date) {
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return this.el.querySelector('.fc-day[data-date="' + formatIsoDay(date) + '"]')
  }

  getDayEls(date) { // TODO: return single el??? accept 'tues'
    if (typeof date === 'number') {
      return findElements(this.el, `.fc-day.${CalendarWrapper.DOW_CLASSNAMES[date]}`)
    }
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return findElements(this.el, '.fc-day[data-date="' + formatIsoDay(date) + '"]')
  }

  getDayNumberText(date) {
    return $(this.getDayEl(date).querySelector('.fc-daygrid-day-top')).text()
  }

  getDayElsInRow(row) {
    return findElements(this.getRowEl(row), '.fc-day')
  }

  // TODO: discourage use
  getNonBusinessDayEls() {
    return findElements(this.el, '.fc-non-business')
  }

  // example: gets all the Mondays in the first row of days
  // TODO: discourage use
  getDowEls(dayAbbrev) {
    return findElements(this.el, `tr:first-child > td.fc-day-${dayAbbrev}`)
  }

  getMonthStartEls() {
    return findElements(this.el, '.fc-daygrid-month-start')
  }

  getDisabledDayEls() {
    return findElements(this.el, '.fc-day-disabled')
  }

  getMoreEl() {
    return this.el.querySelector('.fc-daygrid-more-link')
  }

  getMoreEls() {
    return findElements(this.el, '.fc-daygrid-more-link')
  }

  getWeekNavLinkEls() {
    return findElements(this.el, '.fc-daygrid-week-number[data-navlink]')
  }

  getWeekNumberEls() {
    return findElements(this.el, '.fc-daygrid-week-number')
  }

  getWeekNumberEl(rowIndex) {
    return this.getRowEl(rowIndex).querySelector('.fc-daygrid-week-number')
  }

  getWeekNumberText(rowIndex) {
    return $(this.getWeekNumberEl(rowIndex)).text()
  }

  getNavLinkEl(date) {
    return this.getDayEl(date).querySelector('.fc-daygrid-day-number[data-navlink]')
  }

  clickNavLink(date) {
    $.simulateMouseClick(this.getNavLinkEl(date))
  }

  openMorePopover(index?) {
    if (index == null) {
      $(this.getMoreEl()).simulate('click')
    } else {
      $(this.el.querySelectorAll('.fc-daygrid-more-link')[index]).simulate('click')
    }
  }

  getMorePopoverEl() {
    let viewWrapperEl = this.el.closest('.fc-view-harness')
    return viewWrapperEl.querySelector('.fc-more-popover') as HTMLElement
  }

  getMorePopoverHeaderEl() {
    return this.getMorePopoverEl().querySelector('.fc-popover-header') as HTMLElement
  }

  getMorePopoverEventEls() {
    return findElements(this.getMorePopoverEl(), '.fc-event')
  }

  getMorePopoverEventCnt() { // fg
    return this.getMorePopoverEventEls().length
  }

  getMorePopoverEventTitles() {
    return this.getMorePopoverEventEls().map((el) => $(el.querySelector('.fc-event-title')).text())
  }

  getMorePopoverBgEventCnt() {
    return this.getMorePopoverEl().querySelectorAll('.fc-bg-event').length
  }

  closeMorePopover() {
    $(this.getMorePopoverEl().querySelector('.fc-popover-close')).simulate('click')
  }

  getMorePopoverTitle() {
    return $(this.getMorePopoverEl().querySelector('.fc-popover-title')).text()
  }

  getRowEl(i) {
    return this.el.querySelector(`tr:nth-child(${i + 1})`) as HTMLElement // nth-child is 1-indexed!
  }

  getRowEls() {
    return findElements(this.el, 'tr')
  }

  getBgEventEls(row?) {
    let parentEl = row == null ? this.el : this.getRowEl(row)
    return findElements(parentEl, '.fc-bg-event')
  }

  getEventEls() { // FG events
    return findElements(this.el, '.fc-daygrid-event')
  }

  isEventListItem(el: HTMLElement) {
    return el.classList.contains('fc-daygrid-dot-event')
  }

  getFirstEventEl() {
    return this.el.querySelector('.fc-daygrid-event') as HTMLElement
  }

  getHighlightEls() { // FG events
    return findElements(this.el, '.fc-highlight')
  }

  static getEventElInfo(eventEl) {
    return {
      title: $(eventEl).find('.fc-event-title').text(),
      timeText: $(eventEl).find('.fc-event-time').text(),
    }
  }

  clickDate(date) {
    $.simulateMouseClick(this.getDayEl(date))
  }

  selectDates(start, inclusiveEnd) {
    return new Promise<void>((resolve) => {
      $(this.getDayEls(start)).simulate('drag', {
        point: getRectCenter(this.getDayEl(start).getBoundingClientRect()),
        end: getRectCenter(this.getDayEl(inclusiveEnd).getBoundingClientRect()),
        onRelease: () => resolve(),
      })
    })
  }

  selectDatesTouch(start, inclusiveEnd, debug = false) {
    return new Promise<void>((resolve) => {
      let startEl = this.getDayEl(start)

      setTimeout(() => { // wait for calendar to accept touch :(
        // QUESTION: why do we not need to do press-down first?
        $(startEl).simulate('drag', {
          debug,
          isTouch: true,
          end: getRectCenter(this.getDayEl(inclusiveEnd).getBoundingClientRect()),
          onRelease: () => resolve(),
        })
      }, 0)
    })
  }

  dragEventToDate(eventEl: HTMLElement, startDate, endDate, isTouch?, onBeforeRelease?) {
    return new Promise<void>((resolve) => {
      if (!startDate) {
        let rect1 = this.getDayEl(endDate).getBoundingClientRect()
        let point1 = getRectCenter(rect1)

        $(eventEl).simulate('drag', {
          isTouch: isTouch || false,
          delay: isTouch ? 200 : 0, // bad to hardcode ms
          end: point1,
          onBeforeRelease,
          onRelease: () => resolve(),
        })
      } else {
        let rect0 = this.getDayEl(startDate).getBoundingClientRect()
        let rect1 = this.getDayEl(endDate).getBoundingClientRect()

        let eventRect = eventEl.getBoundingClientRect()
        let point0 = getRectCenter(intersectRects(eventRect, rect0))
        let point1 = getRectCenter(rect1)

        $(eventEl).simulate('drag', {
          isTouch: isTouch || false,
          delay: isTouch ? 200 : 0, // bad to hardcode ms
          point: point0,
          end: point1,
          onBeforeRelease,
          onRelease: () => resolve(),
        })
      }
    })
  }

  resizeEvent(eventEl: HTMLElement, origEndDate, newEndDate, fromStart?, onBeforeRelease?) {
    return new Promise<void>((resolve) => {
      let rect0 = this.getDayEl(origEndDate).getBoundingClientRect()
      let rect1 = this.getDayEl(newEndDate).getBoundingClientRect()

      let resizerEl = $(eventEl).find(
        '.' + (fromStart ? CalendarWrapper.EVENT_START_RESIZER_CLASSNAME : CalendarWrapper.EVENT_END_RESIZER_CLASSNAME),
      ).css('display', 'block')[0] // usually only displays on hover. force display

      let resizerRect = resizerEl.getBoundingClientRect()
      let resizerCenter = getRectCenter(resizerRect)

      let vector = subtractPoints(resizerCenter, rect0)
      let endPoint = addPoints(rect1, vector)

      $(resizerEl).simulate('drag', {
        point: resizerCenter,
        end: endPoint,
        onBeforeRelease,
        onRelease: () => resolve(),
      })
    })
  }

  resizeEventTouch(eventEl: HTMLElement, origEndDate, newEndDate, fromStart?) {
    return new Promise<void>((resolve) => {
      let rect0 = this.getDayEl(origEndDate).getBoundingClientRect()
      let rect1 = this.getDayEl(newEndDate).getBoundingClientRect()

      setTimeout(() => { // wait for calendar to accept touch :(
        $(eventEl).simulate('drag', {
          isTouch: true,
          delay: 200,
          onRelease: () => {
            let resizerEl = eventEl.querySelector(
              '.' + (fromStart ? CalendarWrapper.EVENT_START_RESIZER_CLASSNAME : CalendarWrapper.EVENT_END_RESIZER_CLASSNAME),
            )
            let resizerRect = resizerEl.getBoundingClientRect()
            let resizerCenter = getRectCenter(resizerRect)

            let vector = subtractPoints(resizerCenter, rect0)
            let endPoint = addPoints(rect1, vector)

            $(resizerEl).simulate('drag', {
              isTouch: true,
              point: resizerCenter,
              end: endPoint,
              onRelease: () => resolve(),
            })
          },
        })
      }, 0)
    })
  }
}
