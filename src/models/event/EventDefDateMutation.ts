import { diffByUnit, diffDay, diffDayTime } from '../../util'
import EventDateProfile from './EventDateProfile'


export default class EventDefDateMutation {

  clearEnd: boolean = false
  forceTimed: boolean = false
  forceAllDay: boolean = false

  // Durations. if 0-ms duration, will be null instead.
  // Callers should not set this directly.
  dateDelta: any
  startDelta: any
  endDelta: any


  static createFromDiff(dateProfile0, dateProfile1, largeUnit) {
    let clearEnd = dateProfile0.end && !dateProfile1.end
    let forceTimed = dateProfile0.isAllDay() && !dateProfile1.isAllDay()
    let forceAllDay = !dateProfile0.isAllDay() && dateProfile1.isAllDay()
    let dateDelta
    let endDiff
    let endDelta
    let mutation

    // subtracts the dates in the appropriate way, returning a duration
    function subtractDates(date1, date0) { // date1 - date0
      if (largeUnit) {
        return diffByUnit(date1, date0, largeUnit) // poorly named
      } else if (dateProfile1.isAllDay()) {
        return diffDay(date1, date0) // poorly named
      } else {
        return diffDayTime(date1, date0) // poorly named
      }
    }

    dateDelta = subtractDates(dateProfile1.start, dateProfile0.start)

    if (dateProfile1.end) {
      // use unzonedRanges because dateProfile0.end might be null
      endDiff = subtractDates(
        dateProfile1.unzonedRange.getEnd(),
        dateProfile0.unzonedRange.getEnd()
      )
      endDelta = endDiff.subtract(dateDelta)
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
  buildNewDateProfile(eventDateProfile, calendar) {
    let start = eventDateProfile.start.clone()
    let end = null
    let shouldRezone = false

    if (eventDateProfile.end && !this.clearEnd) {
      end = eventDateProfile.end.clone()
    } else if (this.endDelta && !end) {
      end = calendar.getDefaultEventEnd(eventDateProfile.isAllDay(), start)
    }

    if (this.forceTimed) {
      shouldRezone = true

      if (!start.hasTime()) {
        start.time(0)
      }

      if (end && !end.hasTime()) {
        end.time(0)
      }
    } else if (this.forceAllDay) {

      if (start.hasTime()) {
        start.stripTime()
      }

      if (end && end.hasTime()) {
        end.stripTime()
      }
    }

    if (this.dateDelta) {
      shouldRezone = true

      start.add(this.dateDelta)

      if (end) {
        end.add(this.dateDelta)
      }
    }

    // do this before adding startDelta to start, so we can work off of start
    if (this.endDelta) {
      shouldRezone = true

      end.add(this.endDelta)
    }

    if (this.startDelta) {
      shouldRezone = true

      start.add(this.startDelta)
    }

    if (shouldRezone) {
      start = calendar.applyTimezone(start)

      if (end) {
        end = calendar.applyTimezone(end)
      }
    }

    // TODO: okay to access calendar option?
    if (!end && calendar.opt('forceEventDuration')) {
      end = calendar.getDefaultEventEnd(eventDateProfile.isAllDay(), start)
    }

    return new EventDateProfile(start, end, calendar)
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
