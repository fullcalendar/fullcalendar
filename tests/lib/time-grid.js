// TODO: consolidate with scheduler

import { getBoundingRect } from '../lib/dom-utils'


export function dragTimeGridEvent(eventEl, dropDate) {
  return new Promise(function(resolve) {
    var calendar = $('#cal').fullCalendar('getCalendar')
    var modifiedEvent = null

    calendar.on('eventDragStop', function() {
      setTimeout(function() { // wait for eventDrop to be called
        resolve(modifiedEvent)
      })
    })
    calendar.on('eventDrop', function(event) {
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
    var calendar = $('#cal').fullCalendar('getCalendar')
    var selectInfo = null

    calendar.on('select', function(start, end) {
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


function getTimeGridPoint(date) {
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


export function getTimeGridTop(time) {
  time = moment.duration(time)
  var slotEls = getTimeGridSlotEls(time)

  expect(slotEls.length).toBe(1)

  return slotEls.offset().top + 1 // +1 make sure after border
}


export function getTimeGridDayEls(date) {
  date = $.fullCalendar.moment.parseZone(date)

  return $('.fc-time-grid .fc-day[data-date="' + date.format('YYYY-MM-DD') + '"]')
}


export function getTimeGridSlotEls(timeDuration) {
  timeDuration = moment.duration(timeDuration)
  var date = $.fullCalendar.moment.utc('2016-01-01').time(timeDuration)

  return $('.fc-time-grid .fc-slats tr[data-time="' + date.format('HH:mm:ss') + '"]')
}
