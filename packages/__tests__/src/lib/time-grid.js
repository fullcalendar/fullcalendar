import { formatIsoTime } from './datelib-utils'
import { createDuration } from '@fullcalendar/core'
import { parseUtcDate } from './date-parsing'


export function getTimeGridTop(targetTimeMs) {
  const topBorderWidth = 1 // TODO: kill
  let slotEls = getSlotElByTime(targetTimeMs)
  let $slotEl // used within loop, but we access last val

  // exact slot match
  if (slotEls.length === 1) {
    return slotEls.eq(0).offset().top + topBorderWidth
  }

  slotEls = getSlotEls() // all slots
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

  return $slotEl.offset().top + // last slot's top
    topBorderWidth +
    ($slotEl.outerHeight() *
    Math.min(1, (targetTimeMs - slotTimeMs) / slotMsDuration)) // don't go past end of last slot
}


export function getSlotEls() {
  return $('.fc-time-grid .fc-slats tr[data-time]')
}


function getSlotElByTime(timeMs) {
  let date = parseUtcDate('2016-01-01')
  date = new Date(date.valueOf() + timeMs)

  if (date.getUTCDate() === 1) { // ensure no time overflow/underflow
    return $('.fc-time-grid .fc-slats tr[data-time="' + formatIsoTime(date) + '"]')
  } else {
    return $()
  }
}
