import { getBoundingRect } from '../lib/dom-geom'
import { formatIsoDay, formatIsoTime } from '../datelib/utils'


export function dragTimeGridEvent(eventEl, dropDate) {
  return new Promise(function(resolve) {
    var modifiedEvent = null

    currentCalendar.on('eventDragStop', function() {
      setTimeout(function() { // wait for eventDrop to be called
        resolve(modifiedEvent)
      })
    })
    currentCalendar.on('eventDrop', function(arg) {
      modifiedEvent = arg.event
    })

    eventEl.simulate('drag', {
      localPoint: { left: '50%', top: 1 }, // 1 for zoom
      end: getTimeGridPoint(dropDate)
    })
  })
}


export function selectTimeGrid(start, inclusiveEnd) {
  return new Promise(function(resolve) {
    var selectInfo = null

    currentCalendar.on('select', function(start, end) {
      selectInfo = { start: start, end: end }
    })

    getTimeGridDayEls(start).simulate('drag', {
      point: getTimeGridPoint(start),
      end: getTimeGridPoint(inclusiveEnd),
      onRelease: function() {
        setTimeout(function() { // wait for eventDrop to be called
          resolve(selectInfo)
        })
      }
    })
  })
}


export function getTimeGridPoint(date) {

  if (typeof date === 'string') {
    date = new Date(date)
  }

  var day = FullCalendar.startOfDay(date)
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

  if (typeof date === 'string') {
    date = new Date(date)
  }

  var day = FullCalendar.startOfDay(date)
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
  let slotEls = getTimeGridSlotEls(targetTimeMs)
  let slotEl

  // exact slot match
  if (slotEls.length === 1) {
    return slotEls.eq(0).offset().top + topBorderWidth
  }

  slotEls = $('.fc-time-grid .fc-slats tr[data-time]') // all slots
  let slotTimeMs = null
  let prevSlotTimeMs = null

  for (let i = 0; i < slotEls.length; i++) { // traverse earlier to later
    slotEl = slotEls[i]
    slotEl = $(slotEl)

    prevSlotTimeMs = slotTimeMs
    slotTimeMs = FullCalendar.createDuration(slotEl.data('time')).time

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

  if (typeof date === 'string') {
    date = new Date(date)
  }

  return $('.fc-time-grid .fc-day[data-date="' + formatIsoDay(date) + '"]')
}


export function getTimeGridSlotEls(timeMs) {
  const date = new Date('2016-01-01')
  date = new Date(date.valueOf() + timeMs)

  if (date.getUTCDate() === 1) { // ensure no time overflow/underflow
    return $('.fc-time-grid .fc-slats tr[data-time="' + formatIsoTime(date) + '"]')
  } else {
    return $()
  }
}


// TODO: discourage use
export function getTimeGridDowEls(dayAbbrev) {
  return $(`.fc-time-grid .fc-day.fc-${dayAbbrev}`)
}
