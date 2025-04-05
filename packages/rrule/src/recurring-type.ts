import * as rruleLib from 'rrule' // see https://github.com/jakubroztocil/rrule/issues/548
import { DateInput } from '@fullcalendar/core'
import {
  RecurringType,
  EventRefined,
  DateEnv,
  DateRange,
  DateMarker,
  parseMarker,
  addDays,
} from '@fullcalendar/core/internal'
import { RRuleInputObject } from './event-refiners.js'

interface EventRRuleData {
  rruleSet: rruleLib.RRuleSet

  // if a timezone in dtstart (only Z allowed), it's implicitly stored in the rruleSet
  // if NOT, we need to record the original timezone here
  dateEnv?: DateEnv
}

export const recurringType: RecurringType<EventRRuleData> = {
  parse(eventProps: EventRefined, dateEnv: DateEnv) {
    if (eventProps.rrule != null) {
      let eventRRuleData = parseEventRRule(eventProps, dateEnv)

      if (eventRRuleData) {
        return {
          typeData: {
            rruleSet: eventRRuleData.rruleSet,
            dateEnv: eventRRuleData.isTimeZoneSpecified ? undefined : dateEnv,
          },
          allDayGuess: !eventRRuleData.isTimeSpecified,
          duration: eventProps.duration,
        }
      }
    }

    return null
  },
  expand(
    eventRRuleData: EventRRuleData,
    framingRange: DateRange,
    calendarDateEnv: DateEnv,
  ): DateMarker[] {
    return eventRRuleData.rruleSet.between(
      // Add one-day leeway since rrule lib only operates in UTC,
      // but the zoned variant of framingRange is not.
      // Also overcomes this rrule bug:
      // https://github.com/jakubroztocil/rrule/issues/84)
      addDays(framingRange.start, -1),
      addDays(framingRange.end, 1),
    ).map((date) => {
      // convert to plain-datetime
      return calendarDateEnv.createMarker(
        // convert to epoch-milliseconds in original timezone
        eventRRuleData.dateEnv
          ? eventRRuleData.dateEnv.toDate(date)
          : date, // assumed Z, which doesn't need massaging for rrule
      )
    })
  },
}

function parseEventRRule(eventProps: EventRefined, dateEnv: DateEnv) {
  let rruleSet: rruleLib.RRuleSet
  let isTimeSpecified = false
  let isTimeZoneSpecified = false

  if (typeof eventProps.rrule === 'string') {
    let res = parseRRuleString(eventProps.rrule)
    rruleSet = res.rruleSet
    isTimeSpecified = res.isTimeSpecified
    isTimeZoneSpecified = res.isTimeZoneSpecified
  }

  if (typeof eventProps.rrule === 'object' && eventProps.rrule) { // non-null object
    let res = parseRRuleObject(eventProps.rrule, dateEnv)
    rruleSet = new rruleLib.RRuleSet()
    rruleSet.rrule(res.rrule)
    isTimeSpecified = res.isTimeSpecified
    isTimeZoneSpecified = res.isTimeZoneSpecified
  }

  // convery to arrays. TODO: general util?
  let exdateInputs: DateInput[] = [].concat(eventProps.exdate || [])
  let exruleInputs: RRuleInputObject[] = [].concat(eventProps.exrule || [])

  for (let exdateInput of exdateInputs) {
    let res = parseMarker(exdateInput)
    isTimeSpecified = isTimeSpecified || !res.isTimeUnspecified
    isTimeZoneSpecified = isTimeZoneSpecified || res.timeZoneOffset !== null
    rruleSet.exdate(
      new Date(res.marker.valueOf() - (res.timeZoneOffset || 0) * 60 * 1000), // NOT DRY
    )
  }

  // TODO: exrule is deprecated. what to do? (https://icalendar.org/iCalendar-RFC-5545/a-3-deprecated-features.html)
  for (let exruleInput of exruleInputs) {
    let res = parseRRuleObject(exruleInput, dateEnv)
    isTimeSpecified = isTimeSpecified || res.isTimeSpecified
    isTimeZoneSpecified = isTimeZoneSpecified || res.isTimeZoneSpecified
    rruleSet.exrule(res.rrule)
  }

  return { rruleSet, isTimeSpecified, isTimeZoneSpecified }
}

function parseRRuleObject(rruleInput: RRuleInputObject, dateEnv: DateEnv) {
  let isTimeSpecified = false
  let isTimeZoneSpecified = false

  function processDateInput(dateInput: DateInput) {
    if (typeof dateInput === 'string') {
      let markerData = parseMarker(dateInput)
      if (markerData) {
        isTimeSpecified = isTimeSpecified || !markerData.isTimeUnspecified
        isTimeZoneSpecified = isTimeZoneSpecified || markerData.timeZoneOffset !== null
        return new Date(markerData.marker.valueOf() - (markerData.timeZoneOffset || 0) * 60 * 1000) // NOT DRY
      }
      return null
    }
    return dateInput as Date // TODO: what about number timestamps?
  }

  let rruleOptions: Partial<rruleLib.Options> = {
    ...rruleInput,
    dtstart: processDateInput(rruleInput.dtstart),
    until: processDateInput(rruleInput.until),
    freq: convertConstant(rruleInput.freq),
    wkst: rruleInput.wkst == null
      ? (dateEnv.weekDow - 1 + 7) % 7 // convert Sunday-first to Monday-first
      : convertConstant(rruleInput.wkst),
    byweekday: convertConstants(rruleInput.byweekday),
  }

  return { rrule: new rruleLib.RRule(rruleOptions), isTimeSpecified, isTimeZoneSpecified }
}

function parseRRuleString(str) {
  let rruleSet = rruleLib.rrulestr(str, { forceset: true }) as rruleLib.RRuleSet
  let analysis = analyzeRRuleString(str)

  return { rruleSet, ...analysis }
}

function analyzeRRuleString(str) {
  let isTimeSpecified = false
  let isTimeZoneSpecified = false

  function processMatch(whole: string, introPart: string, datePart: string) {
    let result = parseMarker(datePart)
    isTimeSpecified = isTimeSpecified || !result.isTimeUnspecified
    isTimeZoneSpecified = isTimeZoneSpecified || result.timeZoneOffset !== null
  }

  str.replace(/\b(DTSTART(?:;TZID=[^:]+)?:)([^\n]*)/, processMatch)
  str.replace(/\b(EXDATE:)([^\n]*)/, processMatch)
  str.replace(/\b(UNTIL=)([^;\n]*)/, processMatch)

  return { isTimeSpecified, isTimeZoneSpecified }
}

function convertConstants(input): number | null | number[] | null[] {
  if (Array.isArray(input)) {
    return input.map(convertConstant)
  }
  return convertConstant(input)
}

function convertConstant(input): number | null {
  if (typeof input === 'string') {
    return rruleLib.RRule[input.toUpperCase()]
  }
  return input
}
