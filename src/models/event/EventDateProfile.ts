import UnzonedRange from '../UnzonedRange'
import Calendar from '../../Calendar'
import { DateMarker, startOfDay } from '../../datelib/marker'

/*
Meant to be immutable
*/
export default class EventDateProfile {

  unzonedRange: any
  hasEnd: boolean
  isAllDay: boolean
  forcedStartTimeZoneOffset: number
  forcedEndTimeZoneOffset: number


  constructor(startMarker: DateMarker, endMarker: DateMarker, isAllDay: boolean, calendar: Calendar, forcedStartTimeZoneOffset?: number, forcedEndTimeZoneOffset?: number) {
    this.unzonedRange = new UnzonedRange(
      startMarker,
      endMarker || calendar.getDefaultEventEnd(isAllDay, startMarker)
    )
    this.hasEnd = Boolean(endMarker)
    this.isAllDay = isAllDay
    this.forcedStartTimeZoneOffset = forcedStartTimeZoneOffset
    this.forcedEndTimeZoneOffset = forcedEndTimeZoneOffset
  }


  /*
  Needs an EventSource object
  */
  static parse(rawProps, source) {
    let startInput = rawProps.start || rawProps.date
    let endInput = rawProps.end

    if (!startInput) {
      return false
    }

    let calendar: Calendar = source.calendar
    let startMeta = calendar.dateEnv.createMarkerMeta(startInput)
    let startMarker = startMeta && startMeta.marker
    let endMeta = endInput && calendar.dateEnv.createMarkerMeta(endInput)
    let endMarker = endMeta && endMeta.marker
    let forcedAllDay = rawProps.allDay
    let forceEventDuration = calendar.opt('forceEventDuration')

    if (!startMarker) {
      return false
    }

    if (endMarker && endMarker <= startMarker) {
      endMarker = null
      // TODO: warning?
    }

    if (forcedAllDay == null) {
      forcedAllDay = source.allDayDefault
      if (forcedAllDay == null) {
        forcedAllDay = calendar.opt('allDayDefault')
      }
    }

    if (forcedAllDay === true) {
      startMarker = startOfDay(startMarker)

      if (endMarker) {
        endMarker = startOfDay(endMarker)
      }
    }

    if (!endMarker && forceEventDuration) {
      endMarker = calendar.getDefaultEventEnd(
        startMeta.isTimeUnspecified,
        startMarker
      )
    }

    return new EventDateProfile(
      startMarker,
      endMarker,
      startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified),
      calendar,
      startMeta.forcedTimeZoneOffset,
      endMeta ? endMeta.forcedTimeZoneOffset : null
    )
  }


  static isStandardProp(propName) {
    return propName === 'start' || propName === 'date' || propName === 'end' || propName === 'allDay'
  }

}
