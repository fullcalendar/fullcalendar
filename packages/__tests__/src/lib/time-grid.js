import { getBoundingRect } from '../lib/dom-geom'
import { formatIsoDay, formatIsoTime, ensureDate } from '../datelib/utils'
import { startOfDay, createDuration } from '@fullcalendar/core'
import { parseUtcDate } from './date-parsing'

const TIME_GRID_CLASS = 'fc-time-grid'
const NON_BUSINESS_CLASS = 'fc-nonbusiness'
const CONTENT_SKELETON_CLASS = 'fc-content-skeleton'
const AXIS_CLASS = 'fc-axis'
const BACKGROUND_EVENT_CLASS = 'fc-bgevent'

export function dragTimeGridEvent(eventEl, dropDate) {
  var deferred = $.Deferred()
  var modifiedEvent = null

  currentCalendar.on('eventDragStop', function() {
    setTimeout(function() { // wait for eventDrop to be called
      deferred.resolve(modifiedEvent)
    })
  })
  currentCalendar.on('eventDrop', function(arg) {
    modifiedEvent = arg.event
  })

  eventEl.simulate('drag', {
    localPoint: { left: '50%', top: 1 }, // 1 for zoom
    end: getTimeGridPoint(dropDate)
  })

  return deferred.promise()
}


export function selectTimeGrid(start, inclusiveEnd) {
  var deferred = $.Deferred()
  var selectInfo = null

  currentCalendar.on('select', function(arg) {
    selectInfo = arg
  })

  getTimeGridDayEls(start).simulate('drag', {
    point: getTimeGridPoint(start),
    end: getTimeGridPoint(inclusiveEnd),
    onRelease: function() {
      setTimeout(function() { // wait for eventDrop to be called
        deferred.resolve(selectInfo)
      })
    }
  })

  return deferred.promise()
}


export function getTimeGridPoint(date) {
  date = ensureDate(date)

  var day = startOfDay(date)
  var timeMs = date.valueOf() - day.valueOf()
  var top = getTimeGridTop(timeMs)
  var dayEls = getTimeGridDayEls(date)
  var dayRect

  expect(dayEls.length).toBe(1)
  dayRect = getBoundingRect(dayEls.eq(0))

  return {
    left: (dayRect.left + dayRect.right) / 2,
    top: top
  }
}


export function getTimeGridLine(date) { // not in Scheduler
  date = ensureDate(date)

  var day = startOfDay(date)
  var timeMs = date.valueOf() - day.valueOf()
  var top = getTimeGridTop(timeMs)
  var dayEls = getTimeGridDayEls(date)
  var dayRect

  expect(dayEls.length).toBe(1)
  dayRect = getBoundingRect(dayEls.eq(0))

  return {
    left: dayRect.left,
    right: dayRect.right,
    top: top,
    bottom: top
  }
}


export function getTimeGridTop(targetTimeMs) {
  const topBorderWidth = 1 // TODO: kill
  let slotEls = getSlotElByTime(targetTimeMs)
  let slotEl

  // exact slot match
  if (slotEls.length === 1) {
    return slotEls.eq(0).offset().top + topBorderWidth
  }

  slotEls = getSlotEls() // all slots
  let slotTimeMs = null
  let prevSlotTimeMs = null

  for (let i = 0; i < slotEls.length; i++) { // traverse earlier to later
    slotEl = slotEls[i]
    slotEl = $(slotEl)

    prevSlotTimeMs = slotTimeMs
    slotTimeMs = createDuration(slotEl.data('time')).milliseconds

    // is target time between start of previous slot but before this one?
    if (targetTimeMs < slotTimeMs) {
      // before first slot
      if (!prevSlotTimeMs) {
        return slotEl.offset().top + topBorderWidth
      } else {
        const prevSlotEl = slotEls.eq(i - 1)
        return prevSlotEl.offset().top + // previous slot top
          topBorderWidth +
          (prevSlotEl.outerHeight() *
          ((targetTimeMs - prevSlotTimeMs) / (slotTimeMs - prevSlotTimeMs)))
      }
    }
  }

  // target time must be after the start time of the last slot.
  // `slotTimeMs` is set to the start time of the last slot.

  // guess the duration of the last slot, based on previous duration
  const slotMsDuration = slotTimeMs - prevSlotTimeMs

  return slotEl.offset().top + // last slot's top
    topBorderWidth +
    (slotEl.outerHeight() *
    Math.min(1, (targetTimeMs - slotTimeMs) / slotMsDuration)) // don't go past end of last slot
}


export function getTimeGridDayEls(date) {
  date = ensureDate(date)
  return $('.fc-time-grid .fc-day[data-date="' + formatIsoDay(date) + '"]')
}

export function getSlotEls() {
  return $('.fc-time-grid .fc-slats tr[data-time]')
}


export function getSlotElByIndex(index) {
  return $(`.fc-slats tr:eq(${index})`)
}

export function getSlotElByTime(timeMs) {
  let date = parseUtcDate('2016-01-01')
  date = new Date(date.valueOf() + timeMs)

  if (date.getUTCDate() === 1) { // ensure no time overflow/underflow
    return $('.fc-time-grid .fc-slats tr[data-time="' + formatIsoTime(date) + '"]')
  } else {
    return $()
  }
}

export function getTimeGridNonBusinessDayEls() {
  return $(`.${TIME_GRID_CLASS} .${NON_BUSINESS_CLASS}`)
}

export function queryBgEventsInCol(col) {
  return $(`.${TIME_GRID_CLASS} .${CONTENT_SKELETON_CLASS} td:not(.${AXIS_CLASS}):eq(${col}) .${BACKGROUND_EVENT_CLASS}`)
}

export function queryNonBusinessSegsInCol(col) {
  return $(`.${TIME_GRID_CLASS} .${CONTENT_SKELETON_CLASS} td:not(.${AXIS_CLASS}):eq(${col}) .${NON_BUSINESS_CLASS}`)
}

// TODO: discourage use
export function getTimeGridDowEls(dayAbbrev) {
  return $(`.fc-time-grid .fc-day.fc-${dayAbbrev}`)
}
