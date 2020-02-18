import { findElements, startOfDay, createDuration } from '@fullcalendar/core'
import { formatIsoDay, formatIsoTime, ensureDate } from '../datelib-utils'
import { parseUtcDate } from '../date-parsing'
import { getBoundingRect } from '../dom-geom'


export default class TimeGridWrapper {

  constructor(private el: HTMLElement) {
  }


  getDayEls(date) {
    date = ensureDate(date)
    return findElements(this.el, '.fc-day[data-date="' + formatIsoDay(date) + '"]')
  }

  getSlotEls() { // TODO: rename "slat"
    return findElements(this.el, '.fc-slats tr[data-time]')
  }

  getSlotElByIndex(index) { // TODO: rename "slat"
    return $(`.fc-slats tr:eq(${index})`, this.el).get()
  }

  getSlotElByTime(timeMs) {
    let date = parseUtcDate('2016-01-01')
    date = new Date(date.valueOf() + timeMs)

    if (date.getUTCDate() === 1) { // ensure no time overflow/underflow
      return this.el.querySelector('.fc-slats tr[data-time="' + formatIsoTime(date) + '"]')
    } else {
      return null
    }
  }

  getNonBusinessDayEls() {
    return findElements(this.el, '.fc-nonbusiness')
  }

  queryBgEventsInCol(col) {
    return $(`.fc-content-skeleton td:not(.fc-axis):eq(${col}) .fc-bgevent`, this.el).get()
  }

  queryNonBusinessSegsInCol(col) {
    return $(`.fc-content-skeleton td:not(.fc-axis):eq(${col}) .fc-nonbusiness`, this.el).get()
  }

  // TODO: discourage use
  getDowEls(dayAbbrev) {
    return findElements(this.el, `.fc-day.fc-${dayAbbrev}`)
  }


  dragEventToDate(eventEl: HTMLElement, dropDate) {
    return new Promise((resolve) => {
      $(eventEl).simulate('drag', {
        localPoint: { left: '50%', top: 1 }, // 1 for zoom
        end: this.getPoint(dropDate),
        onRelease: () => resolve()
      })
    })
  }


  resizeEvent(eventEl: HTMLElement, newEndDate) {
    return new Promise((resolve) => {
      $(eventEl).simulate('mouseover') // resizer only shows on hover
      $(eventEl).find('.fc-resizer')
        .simulate('drag', {
          end: this.getPoint(newEndDate),
          onRelease: () => resolve()
        })
    })
  }


  selectDates(start, inclusiveEnd) {
    return new Promise((resolve) => {
      $(this.getDayEls(start)).simulate('drag', {
        point: this.getPoint(start),
        end: this.getPoint(inclusiveEnd),
        onRelease: () => resolve()
      })
    })
  }


  clickDate(date) {
    return new Promise((resolve) => {
      $(this.getDayEls(date)).simulate('drag', {
        point: this.getPoint(date),
        onRelease: () => resolve()
      })
    })
  }


  getRect(start, end) {
    var obj
    if (typeof start === 'object') {
      obj = start
      start = obj.start
      end = obj.end
    }

    start = ensureDate(start)
    end = ensureDate(end)

    var startDay = startOfDay(start)
    var endDay = startOfDay(end)
    var startTimeMs = start.valueOf() - startDay.valueOf()
    var endTimeMs = end.valueOf() - endDay.valueOf()

    if (startDay.valueOf() === endDay.valueOf()) {
      endTimeMs = end.valueOf() - endDay.valueOf()
    } else if (end < start) {
      endTimeMs = startTimeMs
    } else {
      endTimeMs = 1000 * 60 * 60 * 24 // whole day
    }

    var dayEls = this.getDayEls(start)
    var dayRect = getBoundingRect(dayEls)
    return {
      left: dayRect.left,
      right: dayRect.right,
      top: this.getTimeTop(startTimeMs),
      bottom: this.getTimeTop(endTimeMs)
    }
  }


  getPoint(date) {
    date = ensureDate(date)

    var day = startOfDay(date)
    var timeMs = date.valueOf() - day.valueOf()
    var top = this.getTimeTop(timeMs)
    var dayEls = this.getDayEls(date)
    var dayRect

    expect(dayEls.length).toBe(1)
    dayRect = getBoundingRect(dayEls[0])

    return {
      left: (dayRect.left + dayRect.right) / 2,
      top: top
    }
  }


  getLine(date) { // not in Scheduler
    date = ensureDate(date)

    var day = startOfDay(date)
    var timeMs = date.valueOf() - day.valueOf()
    var top = this.getTimeTop(timeMs)
    var dayEls = this.getDayEls(date)
    var dayRect

    expect(dayEls.length).toBe(1)
    dayRect = getBoundingRect(dayEls[0])

    return {
      left: dayRect.left,
      right: dayRect.right,
      top: top,
      bottom: top
    }
  }


  getTimeTop(targetTimeMs) {
    const topBorderWidth = 1 // TODO: kill
    let slotEl = this.getSlotElByTime(targetTimeMs)
    let $slotEl // used within loop, but we access last val

    // exact slot match
    if (slotEl) {
      return $(slotEl).offset().top + topBorderWidth
    }

    let slotEls = this.getSlotEls() // all slots
    let slotTimeMs = null
    let prevSlotTimeMs = null

    for (let i = 0; i < slotEls.length; i++) { // traverse earlier to later
      let slotEl = slotEls[i]
      $slotEl = $(slotEl)

      prevSlotTimeMs = slotTimeMs
      slotTimeMs = createDuration(slotEl.getAttribute('data-time')).milliseconds

      // is target time between start of previous slot but before this one?
      if (targetTimeMs < slotTimeMs) {
        // before first slot
        if (!prevSlotTimeMs) {
          return $slotEl.offset().top + topBorderWidth
        } else {
          let $prevSlotEl = $(slotEls[i - 1])
          return $prevSlotEl.offset().top + // previous slot top
            topBorderWidth +
            ($prevSlotEl.outerHeight() *
            ((targetTimeMs - prevSlotTimeMs) / (slotTimeMs - prevSlotTimeMs)))
        }
      }
    }

    // target time must be after the start time of the last slot.
    // `slotTimeMs` is set to the start time of the last slot.

    // guess the duration of the last slot, based on previous duration
    const slotMsDuration = slotTimeMs - prevSlotTimeMs

    return $slotEl.offset().top + // last slot's top
      topBorderWidth +
      ($slotEl.outerHeight() *
      Math.min(1, (targetTimeMs - slotTimeMs) / slotMsDuration)) // don't go past end of last slot
  }

}
