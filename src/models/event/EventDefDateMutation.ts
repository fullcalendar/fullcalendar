import Calendar from '../../Calendar'
import EventDateProfile from './EventDateProfile'
import { startOfDay, diffWholeDays, diffDayAndTime } from '../../datelib/marker'
import { Duration, createDuration, diffDurations } from '../../datelib/duration'

export default class EventDefDateMutation {

  clearEnd: boolean = false
  forceTimed: boolean = false
  forceAllDay: boolean = false

  // Durations. if 0-ms duration, will be null instead.
  // Callers should not set this directly.
  dateDelta: Duration
  startDelta: Duration
  endDelta: Duration


  static createFromDiff(dateProfile0, dateProfile1, largeUnit, calendar: Calendar) {
    const dateEnv = calendar.dateEnv
    let clearEnd = dateProfile0.end && !dateProfile1.end
    let forceTimed = dateProfile0.isAllDay && !dateProfile1.isAllDay
    let forceAllDay = !dateProfile0.isAllDay && dateProfile1.isAllDay
    let dateDelta
    let endDiff
    let endDelta
    let mutation

    // subtracts the dates in the appropriate way, returning a duration
    function diffDates(date0, date1) {
      if (largeUnit === 'year') {
        return createDuration(dateEnv.diffWholeYears(date0, date1), 'year')
      } else if (largeUnit === 'month') {
        return createDuration(dateEnv.diffWholeMonths(date0, date1), 'month')
      } else if (dateProfile1.isAllDay) {
        return createDuration(diffWholeDays(date0, date1), 'day')
      } else {
        return diffDayAndTime(date0, date1) // returns a duration
      }
    }

    dateDelta = diffDates(dateProfile0.start, dateProfile1.start)

    if (dateProfile1.end) {
      // use unzonedRanges because dateProfile0.end might be null
      endDiff = diffDates(
        dateProfile0.unzonedRange.end,
        dateProfile1.unzonedRange.end
      )
      endDelta = diffDurations(dateDelta, endDiff)
    }

    mutation = new EventDefDateMutation()
    mutation.clearEnd = clearEnd
    mutation.forceTimed = forceTimed
    mutation.forceAllDay = forceAllDay
    mutation.setDateDelta(dateDelta)
    mutation.setEndDelta(endDelta)

    return mutation
  }


  /*
  returns an undo function.
  */
  buildNewDateProfile(eventDateProfile, calendar: Calendar) {
    const dateEnv = calendar.dateEnv
    let isAllDay = eventDateProfile.isAllDay
    let startMarker = eventDateProfile.unzonedRange.start
    let endMarker = null

    if (this.forceAllDay) {
      isAllDay = true
    } else if (this.forceTimed) {
      isAllDay = false
    }

    if (eventDateProfile.hasEnd && !this.clearEnd) {
      endMarker = eventDateProfile.unzonedRange.end
    } else if (this.endDelta && !endMarker) { // won't always be null?
      endMarker = calendar.getDefaultEventEnd(isAllDay, startMarker)
    }

    if (this.forceAllDay) {
      startMarker = startOfDay(startMarker)

      if (endMarker) {
        endMarker = startOfDay(endMarker)
      }
    }

    if (this.dateDelta) {
      startMarker = dateEnv.add(startMarker, this.dateDelta)

      if (endMarker) {
        endMarker = dateEnv.add(endMarker, this.dateDelta)
      }
    }

    // do this before adding startDelta to start, so we can work off of start
    if (this.endDelta) {
      endMarker = dateEnv.add(endMarker, this.endDelta)
    }

    if (this.startDelta) {
      startMarker = dateEnv.add(startMarker, this.startDelta)
    }

    // TODO: okay to access calendar option?
    if (!endMarker && calendar.opt('forceEventDuration')) {
      endMarker = calendar.getDefaultEventEnd(isAllDay, startMarker)
    }

    return new EventDateProfile(startMarker, endMarker, isAllDay, calendar)
  }


  setDateDelta(dateDelta) {
    if (dateDelta && dateDelta.valueOf()) {
      this.dateDelta = dateDelta
    } else {
      this.dateDelta = null
    }
  }


  setStartDelta(startDelta) {
    if (startDelta && startDelta.valueOf()) {
      this.startDelta = startDelta
    } else {
      this.startDelta = null
    }
  }


  setEndDelta(endDelta) {
    if (endDelta && endDelta.valueOf()) {
      this.endDelta = endDelta
    } else {
      this.endDelta = null
    }
  }


  isEmpty() {
    return !this.clearEnd && !this.forceTimed && !this.forceAllDay &&
      !this.dateDelta && !this.startDelta && !this.endDelta
  }

}
