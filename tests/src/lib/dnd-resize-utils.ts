import { parseMarker, addDays } from '@fullcalendar/core/internal'
import { formatIsoDay } from './datelib-utils.js'
import { TimeGridViewWrapper } from './wrappers/TimeGridViewWrapper.js'
import { DayGridViewWrapper } from './wrappers/DayGridViewWrapper.js'
import { CalendarWrapper } from './wrappers/CalendarWrapper.js'

export function testEventDrag(options, dropDate, expectSuccess, callback, eventClassName?) {
  options.editable = true
  options.viewDidMount = () => {
    setTimeout(() => {
      let calendar = currentCalendar
      let isDraggingExternal = false
      let $dayEl
      let $eventEl
      let $dragEl
      let slatIndex
      let $slatEl
      let dx
      let dy
      let allowed
      let dropDateMeta
      let dropDateHasTime

      if (typeof dropDate === 'string') {
        dropDateMeta = parseMarker(dropDate)
        dropDateHasTime = !dropDateMeta.isTimeUnspecified
        dropDate = dropDateMeta.marker
      } else {
        dropDateHasTime = true
      }

      let calendarWrapper = new CalendarWrapper(calendar)
      $eventEl = eventClassName ? $(`.${eventClassName}:first`) : $(calendarWrapper.getFirstEventEl())
      expect($eventEl.length).toBe(1)

      if (dropDateHasTime) {
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        $dragEl = $eventEl.find('.' + CalendarWrapper.EVENT_TIME_CLASSNAME)
        $dayEl = $(timeGridWrapper.getDayEls(dropDate))
        slatIndex = dropDate.getUTCHours() * 2 + (dropDate.getUTCMinutes() / 30) // assumes slotDuration:'30:00'
        $slatEl = $(timeGridWrapper.getSlotElByIndex(slatIndex))
        expect($slatEl.length).toBe(1)
        dy = $slatEl.offset().top - $eventEl.offset().top
      } else {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        $dragEl = $eventEl.find('.' + CalendarWrapper.EVENT_TITLE_CLASSNAME)
        $dayEl = $(dayGridWrapper.getDayEl(dropDate))
        dy = $dayEl.offset().top - $eventEl.offset().top
      }

      if (!$dragEl.length) {
        isDraggingExternal = true
        $dragEl = $eventEl // well, not really an "event" element anymore
      }

      expect($dragEl.length).toBe(1)
      expect($dayEl.length).toBe(1)
      dx = $dayEl.offset().left - $eventEl.offset().left

      $dragEl.simulate('drag', {
        dx,
        dy,
        onBeforeRelease() {
          allowed = calendarWrapper.isAllowingDragging()
          expect(allowed).toBe(expectSuccess)
        },
        onRelease() {
          let eventObj
          let successfulDrop

          if (!isDraggingExternal) { // if dragging an event within the calendar, check dates
            if (eventClassName) {
              eventObj = calendar.getEvents().filter((o) => o.classNames.join(' ') === eventClassName)[0]
            } else {
              eventObj = calendar.getEvents()[0]
            }

            if (dropDateHasTime) { // dropped on a slot
              successfulDrop = eventObj.start.valueOf() === dropDate.valueOf() // compare exact times
            } else { // dropped on a whole day
              // only compare days
              successfulDrop = formatIsoDay(eventObj.start) === formatIsoDay(dropDate)
            }

            expect(successfulDrop).toBe(allowed)
            expect(successfulDrop).toBe(expectSuccess)
          }

          callback()
        },
      })
    }, 0)
  }
  initCalendar(options)
}

export function testEventResize(options, resizeDate, expectSuccess, callback, eventClassName?) {
  options.editable = true
  options.viewDidMount = () => {
    setTimeout(() => {
      let calendar = currentCalendar
      let $lastDayEl
      let lastSlatIndex
      let $lastSlatEl
      let $eventEl
      let $dragEl
      let dx
      let dy
      let allowed
      let resizeDateMeta
      let resizeDateHasTime

      if (typeof resizeDate === 'string') {
        resizeDateMeta = parseMarker(resizeDate)
        resizeDateHasTime = !resizeDateMeta.isTimeUnspecified
        resizeDate = resizeDateMeta.marker
      } else {
        resizeDateHasTime = true
      }

      let calendarWrapper = new CalendarWrapper(calendar)
      $eventEl = eventClassName ? $(`.${eventClassName}:first`) : (() => {
        let eventEls = calendarWrapper.getEventEls()
        return $(eventEls[eventEls.length - 1]) // the last one
      })()

      $dragEl = $eventEl.find('.' + CalendarWrapper.EVENT_RESIZER_CLASSNAME)
        .css('display', 'block') // resizer usually only shows on hover. force-show it

      if (resizeDateHasTime) {
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        $lastDayEl = $(timeGridWrapper.getDayEls(resizeDate))
        lastSlatIndex = resizeDate.getUTCHours() * 2 + (resizeDate.getUTCMinutes() / 30) // assumes slotDuration:'30:00'
        $lastSlatEl = $(timeGridWrapper.getSlotElByIndex(lastSlatIndex - 1))
        expect($lastSlatEl.length).toBe(1)
        dy = $lastSlatEl.offset().top + $lastSlatEl.outerHeight() - ($eventEl.offset().top + $eventEl.outerHeight())
      } else {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        $lastDayEl = $(dayGridWrapper.getDayEl(addDays(resizeDate, -1)))
        dy = $lastDayEl.offset().top - $eventEl.offset().top
      }

      expect($lastDayEl.length).toBe(1)
      expect($eventEl.length).toBe(1)
      expect($dragEl.length).toBe(1)
      dx = $lastDayEl.offset().left + $lastDayEl.outerWidth() - 2 - ($eventEl.offset().left + $eventEl.outerWidth())

      $dragEl.simulate('drag', {
        dx,
        dy,
        onBeforeRelease() {
          allowed = calendarWrapper.isAllowingDragging()
        },
        onRelease() {
          let eventObj
          let successfulDrop

          if (eventClassName) {
            eventObj = calendar.getEvents().filter((o) => o.classNames.join(' ') === eventClassName)[0]
          } else {
            eventObj = calendar.getEvents()[0]
          }

          successfulDrop = eventObj.end && eventObj.end.valueOf() === resizeDate.valueOf()

          expect(allowed).toBe(successfulDrop)
          expect(allowed).toBe(expectSuccess)
          expect(successfulDrop).toBe(expectSuccess)
          callback()
        },
      })
    }, 0)
  }
  initCalendar(options)
}

export function testSelection(options, start, end, expectSuccess, callback) {
  let successfulSelection = false
  let $firstDayEl
  let $lastDayEl
  let firstSlatIndex
  let lastSlatIndex
  let $firstSlatEl
  let $lastSlatEl
  let dx
  let dy
  let $dragEl
  let allowed
  let allDay = false
  let meta

  if (typeof start === 'string') {
    meta = parseMarker(start)
    allDay = allDay || meta.isTimeUnspecified
    start = meta.marker
  }
  if (typeof end === 'string') {
    meta = parseMarker(end)
    allDay = allDay || meta.isTimeUnspecified
    end = meta.marker
  }

  options.selectable = true
  options.select = (arg) => {
    successfulSelection =
      arg.allDay === allDay &&
      arg.start.valueOf() === start.valueOf() &&
      arg.end.valueOf() === end.valueOf()
  }
  spyOn(options, 'select').and.callThrough()

  let calendar = initCalendar(options)
  let calendarWrapper = new CalendarWrapper(calendar)

  if (!allDay) {
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    $firstDayEl = $(timeGridWrapper.getDayEls(start))
    $lastDayEl = $(timeGridWrapper.getDayEls(end))
    firstSlatIndex = start.getUTCHours() * 2 + (start.getUTCMinutes() / 30) // assumes slotDuration:'30:00'
    lastSlatIndex = end.getUTCHours() * 2 + (end.getUTCMinutes() / 30) - 1 // assumes slotDuration:'30:00'
    $firstSlatEl = $(timeGridWrapper.getSlotElByIndex(firstSlatIndex))
    $lastSlatEl = $(timeGridWrapper.getSlotElByIndex(lastSlatIndex))
    expect($firstSlatEl.length).toBe(1)
    expect($lastSlatEl.length).toBe(1)
    dy = $lastSlatEl.offset().top - $firstSlatEl.offset().top
    $dragEl = $firstSlatEl
  } else {
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    $firstDayEl = $(dayGridWrapper.getDayEl(start))
    $lastDayEl = $(dayGridWrapper.getDayEl(new Date(end.valueOf() - 1))) // inclusive
    dy = $lastDayEl.offset().top - $firstDayEl.offset().top
    $dragEl = $firstDayEl
  }

  expect($firstDayEl.length).toBe(1)
  expect($lastDayEl.length).toBe(1)
  dx = $lastDayEl.offset().left - $firstDayEl.offset().left

  $dragEl.simulate('drag', {
    dx,
    dy,
    onBeforeRelease() {
      allowed = calendarWrapper.isAllowingDragging()
    },
    onRelease() {
      if (expectSuccess) {
        expect(options.select).toHaveBeenCalled()
      }
      expect(expectSuccess).toBe(allowed)
      expect(expectSuccess).toBe(successfulSelection)
      expect(allowed).toBe(successfulSelection)
      callback()
    },
  })
}
