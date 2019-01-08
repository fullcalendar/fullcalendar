import UnzonedRange from '../UnzonedRange'

/*
Meant to be immutable
*/
export default class EventDateProfile {

  start: any
  end: any
  unzonedRange: any


  constructor(start, end, calendar) {
    this.start = start
    this.end = end || null
    this.unzonedRange = this.buildUnzonedRange(calendar)
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

    let calendar = source.calendar
    let start = calendar.moment(startInput)
    let end = endInput ? calendar.moment(endInput) : null
    let forcedAllDay = rawProps.allDay
    let forceEventDuration = calendar.opt('forceEventDuration')

    if (!start.isValid()) {
      return false
    }

    if (forcedAllDay == null) {
      forcedAllDay = source.allDayDefault
      if (forcedAllDay == null) {
        forcedAllDay = calendar.opt('allDayDefault')
      }
    }

    if (forcedAllDay === true) {
      start.stripTime()
      if (end) {
        end.stripTime()
      }
    } else if (forcedAllDay === false) {
      if (!start.hasTime()) {
        start.time(0)
      }
      if (end && !end.hasTime()) {
        end.time(0)
      }
    }

    if (end && (!end.isValid() || !end.isAfter(start))) {
      end = null
    }

    if (!end && forceEventDuration) {
      end = calendar.getDefaultEventEnd(!start.hasTime(), start)
    }

    return new EventDateProfile(start, end, calendar)
  }


  static isStandardProp(propName) {
    return propName === 'start' || propName === 'date' || propName === 'end' || propName === 'allDay'
  }


  isAllDay() { // why recompute this every time?
    return !(this.start.hasTime() || (this.end && this.end.hasTime()))
  }


  /*
  Needs a Calendar object
  */
  buildUnzonedRange(calendar) {
    let startMs = this.start.clone().stripZone().valueOf()
    let endMs = this.getEnd(calendar).stripZone().valueOf()

    return new UnzonedRange(startMs, endMs)
  }


  /*
  Needs a Calendar object
  */
  getEnd(calendar) {
    return this.end ?
      this.end.clone() :
      // derive the end from the start and allDay. compute allDay if necessary
      calendar.getDefaultEventEnd(
        this.isAllDay(),
        this.start
      )
  }

}
