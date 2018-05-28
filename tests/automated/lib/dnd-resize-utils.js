
// this function has been mangled to work with external jqui draggables as well
import {getEventElTimeEl, getTimeGridDayEls, getTimeGridSlotElByIndex} from "./time-grid";
import {getEventElResizerEl, getEventElTitleEl, getFirstEventEl, getLastEventEl} from "./MonthViewUtils";
import {getSingleDayEl} from "../view-render/DayGridRenderUtils";


export function testEventDrag(options, dropDate, expectSuccess, callback, eventClassName) {
  var eventsRendered = false

  options.editable = true
  options.eventAfterAllRender = function() {
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

    dropDate = calendar.moment(dropDate)
    eventEl = getFirstEventEl(eventClassName)

    if (dropDate.hasTime()) {
      dragEl = getEventElTimeEl(eventEl)
      dayEl = getTimeGridDayEls(dropDate)
      slatIndex = dropDate.hours() * 2 + (dropDate.minutes() / 30) // assumes slotDuration:'30:00'
      slatEl = getTimeGridSlotElByIndex(slatIndex)
      dy = slatEl.offset().top - eventEl.offset().top
    } else {
      dragEl = getEventElTitleEl(eventEl)
      dayEl = getSingleDayEl(dropDate.clone(), bg=false)
      dy = dayEl.offset().top - eventEl.offset().top
    }

    if (!dragEl.length) {
      isDraggingExternal = true
      dragEl = eventEl // well, not really an "event" element anymore
    }

    expect(dragEl.length).toBe(1)
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
            eventObj = calendar.clientEvents(function(o) {
              return o.className.join(' ') === eventClassName
            })[0]
          } else {
            eventObj = calendar.clientEvents()[0]
          }

          if (dropDate.hasTime()) { // dropped on a slot
            successfulDrop = eventObj.start.format() === dropDate.format() // compare exact times
          } else { // dropped on a whole day
            // only compare days
            successfulDrop = eventObj.start.format('YYYY-MM-DD') === dropDate.format('YYYY-MM-DD')
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
  options.eventAfterAllRender = function() {
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

    resizeDate = calendar.moment(resizeDate)
    eventEl = getLastEventEl(eventClassName)
    dragEl = getEventElResizerEl(eventEl)

    if (resizeDate.hasTime()) {
      lastDayEl = getTimeGridDayEls(resizeDate.clone())
      lastSlatIndex = resizeDate.hours() * 2 + (resizeDate.minutes() / 30) // assumes slotDuration:'30:00'
      lastSlatEl = getTimeGridSlotElByIndex(lastSlatIndex - 1)
      dy = lastSlatEl.offset().top + lastSlatEl.outerHeight() - (eventEl.offset().top + eventEl.outerHeight())
    } else {
      lastDayEl = getSingleDayEl(resizeDate.clone().add(-1, 'day'), bg=false)
      dy = lastDayEl.offset().top - eventEl.offset().top
    }

    expect(lastDayEl.length).toBe(1)
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
          eventObj = calendar.clientEvents(function(o) {
            return o.className.join(' ') === eventClassName
          })[0]
        } else {
          eventObj = calendar.clientEvents()[0]
        }

        successfulDrop = eventObj.end && eventObj.end.format() === resizeDate.format()

        expect(allowed).toBe(successfulDrop)
        expect(allowed).toBe(expectSuccess)
        expect(successfulDrop).toBe(expectSuccess)
        callback()
      }
    })
  }
  initCalendar(options)
}


// always starts at 2014-11-12
export function testSelection(options, startTime, end, expectSuccess, callback) {
  var successfulSelection = false
  var calendar
  var start
  var firstDayEl, lastDayEl
  var firstSlatIndex, lastSlatIndex
  var firstSlatEl, lastSlatEl
  var dx, dy
  var dragEl
  var allowed

  options.selectable = true
  options.select = function(selectionStart, selectionEnd) {
    successfulSelection =
      selectionStart.format() === start.format() &&
        selectionEnd.format() === end.format()
  }
  spyOn(options, 'select').and.callThrough()
  initCalendar(options)

  calendar = currentCalendar
  start = calendar.moment('2014-11-12')
  end = calendar.moment(end)

  if (startTime) {
    start.time(startTime)
    firstDayEl = getTimeGridDayEls(start)
    lastDayEl = getTimeGridDayEls(end)
    firstSlatIndex = start.hours() * 2 + (start.minutes() / 30) // assumes slotDuration:'30:00'
    lastSlatIndex = end.hours() * 2 + (end.minutes() / 30) - 1 // assumes slotDuration:'30:00'
    firstSlatEl = getTimeGridSlotElByIndex(firstSlatIndex)
    lastSlatEl = getTimeGridSlotElByIndex(lastSlatIndex)
    dy = lastSlatEl.offset().top - firstSlatEl.offset().top
    dragEl = firstSlatEl
  } else {
    end.stripTime()
    firstDayEl = getSingleDayEl(start, bg=false)
    lastDayEl = getSingleDayEl(end.clone().add(-1, 'day'), bg=false)
    dy = lastDayEl.offset().top - firstDayEl.offset().top
    dragEl = firstDayEl
  }

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
