import { getBoundingRect } from '../lib/dom-geom'


export function dragTimeGridEvent(eventEl, dropDate) {
  return new Promise(function(resolve) {
    var modifiedEvent = null

    currentCalendar.on('eventDragStop', function() {
      setTimeout(function() { // wait for eventDrop to be called
        resolve(modifiedEvent)
      })
    })
    currentCalendar.on('eventDrop', function(event) {
      modifiedEvent = event
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
  date = $.fullCalendar.moment.parseZone(date)
  var top = getTimeGridTop(date.time())
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
  date = $.fullCalendar.moment.parseZone(date)
  var top = getTimeGridTop(date.time())
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


/*
targetTime is a time (duration) that can be in between slots
*/
export function getTimeGridTop(targetTime) {
  let slotEl
  targetTime = moment.duration(targetTime)
  let slotEls = getTimeGridSlotEls(targetTime)
  const topBorderWidth = 1 // TODO: kill

  // exact slot match
  if (slotEls.length === 1) {
    return slotEls.eq(0).offset().top + topBorderWidth
  }

  slotEls = $('.fc-time-grid .fc-slats tr[data-time]') // all slots
  let slotTime = null
  let prevSlotTime = null

  for (let i = 0; i < slotEls.length; i++) { // traverse earlier to later
    slotEl = slotEls[i]
    slotEl = $(slotEl)

    prevSlotTime = slotTime
    slotTime = moment.duration(slotEl.data('time'))

    // is target time between start of previous slot but before this one?
    if (targetTime < slotTime) {
      // before first slot
      if (!prevSlotTime) {
        return slotEl.offset().top + topBorderWidth
      } else {
        const prevSlotEl = slotEls.eq(i - 1)
        return prevSlotEl.offset().top + // previous slot top
          topBorderWidth +
          (prevSlotEl.outerHeight() *
          ((targetTime - prevSlotTime) / (slotTime - prevSlotTime)))
      }
    }
  }

  // target time must be after the start time of the last slot.
  // `slotTime` is set to the start time of the last slot.

  // guess the duration of the last slot, based on previous duration
  const slotMsDuration = slotTime - prevSlotTime

  return slotEl.offset().top + // last slot's top
    topBorderWidth +
    (slotEl.outerHeight() *
    Math.min(1, (targetTime - slotTime) / slotMsDuration)) // don't go past end of last slot
}


export function getTimeGridDayEls(date) {
  date = $.fullCalendar.moment.parseZone(date)

  return $('.fc-time-grid .fc-day[data-date="' + date.format('YYYY-MM-DD') + '"]')
}


export function getTimeGridSlotEls(timeDuration) {
  timeDuration = moment.duration(timeDuration)
  const date = $.fullCalendar.moment.utc('2016-01-01').time(timeDuration)
  if (date.date() === 1) { // ensure no time overflow/underflow
    return $(`.fc-time-grid .fc-slats tr[data-time="${date.format('HH:mm:ss')}"]`)
  } else {
    return $()
  }
}


// TODO: discourage use
export function getTimeGridDowEls(dayAbbrev) {
  return $(`.fc-time-grid .fc-day.fc-${dayAbbrev}`)
}
