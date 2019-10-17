import { formatIsoDay } from '../datelib/utils'
import { getTimeGridDayEls, getSlotElByIndex } from './time-grid'
import { getDayEl } from '../view-render/DayGridRenderUtils'
import {
  getEventElResizerEl,
  getEventElTitleEl,
  getEventElTimeEl,
  getFirstEventEl,
  getLastEventEl
} from '../event-render/EventRenderUtils'
import { parseMarker, addDays } from '@fullcalendar/core'

export function testEventDrag(options, dropDate, expectSuccess, callback, eventClassName) {
  var eventsRendered = false

  options.editable = true
  options._eventsPositioned = function() {
    var calendar = currentCalendar
    var isDraggingExternal = false
    var dayEl
    var eventEl
    var dragEl
    var slatIndex
    var slatEl
    var dx, dy
    var allowed

    if (eventsRendered) { return }
    eventsRendered = true

    var dropDateMeta
    var dropDateHasTime
    if (typeof dropDate === 'string') {
      dropDateMeta = parseMarker(dropDate)
      dropDateHasTime = !dropDateMeta.isTimeUnspecified
      dropDate = dropDateMeta.marker
    } else {
      dropDateHasTime = true
    }

    eventEl = eventClassName ? $(`.${eventClassName}:first`) : getFirstEventEl()
    expect(eventEl.length).toBe(1)

    if (dropDateHasTime) {
      dragEl = getEventElTimeEl(eventEl)
      dayEl = getTimeGridDayEls(dropDate)
      slatIndex = dropDate.getUTCHours() * 2 + (dropDate.getUTCMinutes() / 30) // assumes slotDuration:'30:00'
      slatEl = getSlotElByIndex(slatIndex)
      expect(slatEl.length).toBe(1)
      dy = slatEl.offset().top - eventEl.offset().top
    } else {
      dragEl = getEventElTitleEl(eventEl)
      dayEl = getDayEl(dropDate)
      dy = dayEl.offset().top - eventEl.offset().top
    }

    if (!dragEl.length) {
      isDraggingExternal = true
      dragEl = eventEl // well, not really an "event" element anymore
    }

    expect(dragEl.length).toBe(1)
    expect(dayEl.length).toBe(1)
    dx = dayEl.offset().left - eventEl.offset().left

    dragEl.simulate('drag', {
      dx: dx,
      dy: dy,
      onBeforeRelease: function() {
        allowed = !$('body').hasClass('fc-not-allowed')
        expect(allowed).toBe(expectSuccess)
      },
      onRelease: function() {
        var eventObj
        var successfulDrop

        if (!isDraggingExternal) { // if dragging an event within the calendar, check dates

          if (eventClassName) {
            eventObj = calendar.getEvents().filter(function(o) {
              return o.classNames.join(' ') === eventClassName
            })[0]
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
      }
    })
  }
  initCalendar(options)
}


export function testEventResize(options, resizeDate, expectSuccess, callback, eventClassName) {
  var eventsRendered = false

  options.editable = true
  options._eventsPositioned = function() {
    var calendar = currentCalendar
    var lastDayEl
    var lastSlatIndex
    var lastSlatEl
    var eventEl
    var dragEl
    var dx, dy
    var allowed

    if (eventsRendered) { return }
    eventsRendered = true

    var resizeDateMeta
    var resizeDateHasTime
    if (typeof resizeDate === 'string') {
      resizeDateMeta = parseMarker(resizeDate)
      resizeDateHasTime = !resizeDateMeta.isTimeUnspecified
      resizeDate = resizeDateMeta.marker
    } else {
      resizeDateHasTime = true
    }

    eventEl = eventClassName ? $(`.${eventClassName}:first`) : getLastEventEl()
    dragEl = getEventElResizerEl(eventEl)

    if (resizeDateHasTime) {
      lastDayEl = getTimeGridDayEls(resizeDate)
      lastSlatIndex = resizeDate.getUTCHours() * 2 + (resizeDate.getUTCMinutes() / 30) // assumes slotDuration:'30:00'
      lastSlatEl = getSlotElByIndex(lastSlatIndex - 1)
      expect(lastSlatEl.length).toBe(1)
      dy = lastSlatEl.offset().top + lastSlatEl.outerHeight() - (eventEl.offset().top + eventEl.outerHeight())
    } else {
      lastDayEl = getDayEl(addDays(resizeDate, -1))
      dy = lastDayEl.offset().top - eventEl.offset().top
    }

    expect(lastDayEl.length).toBe(1)
    expect(eventEl.length).toBe(1)
    expect(dragEl.length).toBe(1)
    dx = lastDayEl.offset().left + lastDayEl.outerWidth() - 2 - (eventEl.offset().left + eventEl.outerWidth())

    dragEl.simulate('mouseover') // resizer only shows up on mouseover
    dragEl.simulate('drag', {
      dx: dx,
      dy: dy,
      onBeforeRelease: function() {
        allowed = !$('body').hasClass('fc-not-allowed')
      },
      onRelease: function() {
        var eventObj
        var successfulDrop

        if (eventClassName) {
          eventObj = calendar.getEvents(function(o) {
            return o.classNames.join(' ') === eventClassName
          })[0]
        } else {
          eventObj = calendar.getEvents()[0]
        }

        successfulDrop = eventObj.end && eventObj.end.valueOf() === resizeDate.valueOf()

        expect(allowed).toBe(successfulDrop)
        expect(allowed).toBe(expectSuccess)
        expect(successfulDrop).toBe(expectSuccess)
        callback()
      }
    })
  }
  initCalendar(options)
}


export function testSelection(options, start, end, expectSuccess, callback) {
  var successfulSelection = false
  var firstDayEl, lastDayEl
  var firstSlatIndex, lastSlatIndex
  var firstSlatEl, lastSlatEl
  var dx, dy
  var dragEl
  var allowed

  var allDay = false
  var meta
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
  options.select = function(arg) {
    successfulSelection =
      arg.allDay === allDay &&
      arg.start.valueOf() === start.valueOf() &&
      arg.end.valueOf() === end.valueOf()
  }
  spyOn(options, 'select').and.callThrough()
  initCalendar(options)

  if (!allDay) {
    firstDayEl = getTimeGridDayEls(start)
    lastDayEl = getTimeGridDayEls(end)
    firstSlatIndex = start.getUTCHours() * 2 + (start.getUTCMinutes() / 30) // assumes slotDuration:'30:00'
    lastSlatIndex = end.getUTCHours() * 2 + (end.getUTCMinutes() / 30) - 1 // assumes slotDuration:'30:00'
    firstSlatEl = getSlotElByIndex(firstSlatIndex)
    lastSlatEl = getSlotElByIndex(lastSlatIndex)
    expect(firstSlatEl.length).toBe(1)
    expect(lastSlatEl.length).toBe(1)
    dy = lastSlatEl.offset().top - firstSlatEl.offset().top
    dragEl = firstSlatEl
  } else {
    firstDayEl = getDayEl(start)
    lastDayEl = getDayEl(new Date(end.valueOf() - 1)) // inclusive
    dy = lastDayEl.offset().top - firstDayEl.offset().top
    dragEl = firstDayEl
  }

  expect(firstDayEl.length).toBe(1)
  expect(lastDayEl.length).toBe(1)
  dx = lastDayEl.offset().left - firstDayEl.offset().left

  dragEl.simulate('drag', {
    dx: dx,
    dy: dy,
    onBeforeRelease: function() {
      allowed = !$('body').hasClass('fc-not-allowed')
    },
    onRelease: function() {
      if (expectSuccess) {
        expect(options.select).toHaveBeenCalled()
      }
      expect(expectSuccess).toBe(allowed)
      expect(expectSuccess).toBe(successfulSelection)
      expect(allowed).toBe(successfulSelection)
      callback()
    }
  })
}
