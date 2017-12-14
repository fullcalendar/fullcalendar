
export function getTimeTexts() {
  return $('.fc-event').map(function(i, eventEl) {
    return $(eventEl).find('.fc-time').text()
  }).get()
}


/*
Returns a boolean.
TODO: check isStart/isEnd.
*/
export function checkEventRendering(start, end) {

  start = $.fullCalendar.moment.parseZone(start)
  end = $.fullCalendar.moment.parseZone(end)

  var expectedRects = computeSpanRects(start, end)
  var eventEls = $('.fc-event') // sorted by DOM order. not good for RTL
  var isMatch = checkEventRenderingMatch(expectedRects, eventEls)

  return {
    rects: expectedRects,
    els: eventEls,
    length: eventEls.length,
    isMatch: isMatch
  }
}


function checkEventRenderingMatch(expectedRects, eventEls) {
  var expectedLength = expectedRects.length
  var i, expectedRect
  var elRect

  if (eventEls.length !== expectedLength) {
    console.log('does not match element count')
    return false
  }

  for (i = 0; i < expectedLength; i++) {
    expectedRect = expectedRects[i]
    elRect = eventEls[i].getBoundingClientRect()

    // horizontally contained AND vertically really similar?
    if (!(
      elRect.left >= expectedRect.left &&
      elRect.right <= expectedRect.right &&
      Math.abs(elRect.top - expectedRect.top) < 1 &&
      Math.abs(elRect.bottom - expectedRect.bottom) < 1
    )) {
      console.log('rects do not match')
      return false
    }
  }

  return true
}


export function computeSpanRects(start, end) {
  var dayStructs = computeDays()
  var slotStructs = computeSlots()
  var dayI, dayStruct
  var slotI, slotStruct
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

      slotStart = dayStruct.date.clone().time(0)
        .add(slotStruct.dayOffset, 'days')
        .add(slotStruct.startTime)

      slotEnd = dayStruct.date.clone().time(0)
        .add(slotStruct.dayOffset, 'days')
        .add(slotStruct.endTime)

      if (startTop === null) { // looking for the start
        coverage = (start - slotStart) / (slotEnd - slotStart)
        startTop = (coverage > 0 && coverage <= 1)
          ? (slotStruct.top + slotStruct.height * coverage)
          : null
      } else { // looking for the end
        coverage = (end - slotStart) / (slotEnd - slotStart)
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
  var dayEls = $('.fc-day-header[data-date]')

  var days = dayEls.map(function(i, node) {
    var rect = node.getBoundingClientRect()
    return $.extend({}, rect, {
      date: $.fullCalendar.moment.parseZone(
        $(node).data('date')
      )
    })
  }).get()

  return days
}


function computeSlots() {
  var slotEls = $('.fc-time-grid .fc-slats tr[data-time]')

  var slots = slotEls.map(function(i, node) {
    var rect = node.getBoundingClientRect()
    return $.extend({}, rect, {
      startTime: moment.duration(
        $(node).data('time')
      )
    })
  }).get()

  var len = slots.length
  if (len < 3) {
    console.log('need at least 3 slots')
    return []
  }

  var mid = Math.floor(len / 2)
  var i = mid - 1
  var standardMs = slots[mid + 1].startTime - slots[mid].startTime
  var ms
  var dayOffset = 0

  // iterate from one-before middle to beginning
  for (i = mid - 1; i >= 0; i--) {
    ms = slots[i + 1].startTime - slots[i].startTime

    // big deviation? assume moved to previous day (b/c of special minTime)
    if (Math.abs(ms - standardMs) > standardMs * 2) {
      dayOffset--
      slots[i].endTime = moment.duration(slots[i].startTime).add(standardMs)
    } else { // otherwise, current slot's end is next slot's beginning
      slots[i].endTime = moment.duration(slots[i + 1].startTime)
    }

    slots[i].dayOffset = dayOffset
  }

  dayOffset = 0

  // iterate from middle to one-before last
  for (i = mid; i < len - 1; i++) {
    ms = slots[i + 1].startTime - slots[i].startTime

    slots[i].dayOffset = dayOffset

    // big deviation? assume moved to next day (b/c of special maxTime)
    if (Math.abs(ms - standardMs) > standardMs * 2) {
      dayOffset++ // will apply to the next slotStruct
      slots[i].endTime = moment.duration(slots[i].startTime).add(standardMs)
    } else { // otherwise, current slot's end is next slot's beginning
      slots[i].endTime = moment.duration(slots[i + 1].startTime)
    }
  }

  // assume last slot has the standard duration
  slots[i].endTime = moment.duration(slots[i].startTime).add(standardMs)
  slots[i].dayOffset = dayOffset

  // if last slot went over the day threshold
  if (slots[i].endTime.as('days') > 1) {
    slots[i].endTime.subtract(1, 'day')
    slots[i].dayOffset++
  }

  return slots
}
