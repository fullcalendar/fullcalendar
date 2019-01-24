import { getDayOfWeekHeaderEls } from './DayGridRenderUtils' // bad to rely on day grid
import { getSlotEls } from '../lib/time-grid'
import { ensureDate } from '../datelib/utils'
import { addDays, addMs, parseMarker, createDuration } from '@fullcalendar/core'

export function getTimeAxisInfo() {
  return $('.fc-slats tr[data-time]').map(function(i, tr) {
    return {
      text: $(tr).find('.fc-time').text(),
      isMajor: !$(tr).hasClass('fc-minor')
    }
  }).get()
}


// for https://github.com/fullcalendar/fullcalendar-scheduler/issues/363
export function isStructureValid() {
  return $('.fc-time-grid .fc-content-skeleton').length === 1
}


export function computeSpanRects(start, end) {
  start = ensureDate(start)
  end = ensureDate(end)

  var dayStructs = computeDays()
  /** @type {any} */
  var slotStructs = computeSlots()

  var dayI, dayStruct
  var slotI, slotStruct
  var slotDayStart
  var slotStart
  var slotEnd
  var coverage
  var startTop = null
  var endTop = null
  var rects = []

  for (dayI = 0; dayI < dayStructs.length; dayI++) {
    dayStruct = dayStructs[dayI]

    for (slotI = 0; slotI < slotStructs.length; slotI++) {
      slotStruct = slotStructs[slotI]

      slotDayStart = addDays(
        dayStruct.date,
        slotStruct.dayOffset
      )

      slotStart = addMs(
        slotDayStart,
        slotStruct.startTimeMs
      )

      slotEnd = addMs(
        slotDayStart,
        slotStruct.endTimeMs
      )

      if (startTop === null) { // looking for the start
        coverage = (start - slotStart.valueOf()) / (slotEnd.valueOf() - slotStart.valueOf())
        startTop = (coverage > 0 && coverage <= 1)
          ? (slotStruct.top + slotStruct.height * coverage)
          : null
      } else { // looking for the end
        coverage = (end - slotStart.valueOf()) / (slotEnd.valueOf() - slotStart.valueOf())
        endTop = (coverage >= 0 && coverage < 1) // exclusive
          ? (slotStruct.top + slotStruct.height * coverage)
          : null

        if (endTop !== null) { // found end
          rects.push({
            left: dayStruct.left,
            right: dayStruct.right,
            top: startTop,
            bottom: endTop,
            width: dayStruct.right - dayStruct.left,
            height: endTop - startTop
          })
          startTop = null
        }
      }
    }

    if (startTop !== null) { // could not find the start in this day
      rects.push({
        left: dayStruct.left,
        right: dayStruct.right,
        top: startTop,
        bottom: slotStruct.bottom,
        width: dayStruct.right - dayStruct.left,
        height: slotStruct.bottom - startTop
      })
      startTop = slotStructs[0].top // top of next column
    }
  }

  return rects
}


function computeDays() {
  var dayOfWeekHeaderEls = getDayOfWeekHeaderEls()

  var days = dayOfWeekHeaderEls.map(function(i, node) {
    var rect = node.getBoundingClientRect()
    return $.extend({}, rect, {
      date: parseMarker(
        $(node).data('date')
      ).marker
    })
  }).get()

  return days
}


function computeSlots() {
  var slotEls = getSlotEls()

  /** @type {any} */
  var slots = slotEls.map(function(i, node) {
    var rect = node.getBoundingClientRect()
    return $.extend({}, rect, {
      startTimeMs: createDuration(
        $(node).data('time')
      ).milliseconds
    })
  }).get()

  var len = slots.length
  if (len < 3) {
    console.log('need at least 3 slots')
    return []
  }

  var mid = Math.floor(len / 2)
  var i = mid - 1
  var standardMs = slots[mid + 1].startTimeMs - slots[mid].startTimeMs
  var ms
  var dayOffset = 0

  // iterate from one-before middle to beginning
  for (i = mid - 1; i >= 0; i--) {
    ms = slots[i + 1].startTimeMs - slots[i].startTimeMs

    // big deviation? assume moved to previous day (b/c of special minTime)
    if (Math.abs(ms - standardMs) > standardMs * 2) {
      dayOffset--
      slots[i].endTimeMs = slots[i].startTimeMs + standardMs
    } else { // otherwise, current slot's end is next slot's beginning
      slots[i].endTimeMs = slots[i + 1].startTimeMs
    }

    slots[i].dayOffset = dayOffset
  }

  dayOffset = 0

  // iterate from middle to one-before last
  for (i = mid; i < len - 1; i++) {
    ms = slots[i + 1].startTimeMs - slots[i].startTimeMs

    slots[i].dayOffset = dayOffset

    // big deviation? assume moved to next day (b/c of special maxTime)
    if (Math.abs(ms - standardMs) > standardMs * 2) {
      dayOffset++ // will apply to the next slotStruct
      slots[i].endTimeMs = slots[i].startTimeMs + standardMs
    } else { // otherwise, current slot's end is next slot's beginning
      slots[i].endTimeMs = slots[i + 1].startTimeMs
    }
  }

  // assume last slot has the standard duration
  slots[i].endTimeMs = slots[i].startTimeMs + standardMs
  slots[i].dayOffset = dayOffset

  // if last slot went over the day threshold
  if (slots[i].endTimeMs > 1000 * 60 * 60 * 24) {
    slots[i].endTimeMs -= 1000 * 60 * 60 * 24
    slots[i].dayOffset++
  }

  return slots
}
