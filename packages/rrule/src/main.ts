import { RRule, RRuleSet, rrulestr, Options as RRuleOptions } from 'rrule'
import {
  RecurringType,
  EventRefined,
  DateEnv,
  DateRange,
  DateMarker,
  createPlugin,
  parseMarker,
  DateInput,
} from '@fullcalendar/common'
import { RRULE_EVENT_REFINERS, RRuleInputObject } from './event-refiners'
import './event-declare'

interface EventRRuleData {
  rruleSet: RRuleSet
  isTimeZoneSpecified: boolean
}

let recurring: RecurringType<EventRRuleData> = {
  parse(eventProps: EventRefined, dateEnv: DateEnv) {
    if (eventProps.rrule != null) {
      let eventRRuleData = parseEventRRule(eventProps, dateEnv)

      if (eventRRuleData) {
        return {
          typeData: { rruleSet: eventRRuleData.rruleSet, isTimeZoneSpecified: eventRRuleData.isTimeZoneSpecified },
          allDayGuess: !eventRRuleData.isTimeSpecified,
          duration: eventProps.duration,
        }
      }
    }

    return null
  },
  expand(eventRRuleData: EventRRuleData, framingRange: DateRange, dateEnv: DateEnv): DateMarker[] {
    let dates: DateMarker[]

    if (eventRRuleData.isTimeZoneSpecified) {
      dates = eventRRuleData.rruleSet.between(
        dateEnv.toDate(framingRange.start), // rrule lib will treat as UTC-zoned
        dateEnv.toDate(framingRange.end), // (same)
        true, // inclusive (will give extra events at start, see https://github.com/jakubroztocil/rrule/issues/84)
      ).map((date) => dateEnv.createMarker(date)) // convert UTC-zoned-date to locale datemarker
    } else {
      // when no timezone in given start/end, the rrule lib will assume UTC,
      // which is same as our DateMarkers. no need to manipulate
      dates = eventRRuleData.rruleSet.between(
        framingRange.start,
        framingRange.end,
        true, // inclusive (will give extra events at start, see https://github.com/jakubroztocil/rrule/issues/84)
      )
    }
    return dates
  },
}

export default createPlugin({
  recurringTypes: [recurring],
  eventRefiners: RRULE_EVENT_REFINERS,
})

function parseEventRRule(eventProps: EventRefined, dateEnv: DateEnv) {
  let rruleSet: RRuleSet
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
    rruleSet = new RRuleSet()
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

  let rruleOptions: Partial<RRuleOptions> = {
    ...rruleInput,
    dtstart: processDateInput(rruleInput.dtstart),
    until: processDateInput(rruleInput.until),
    freq: convertConstant(rruleInput.freq),
    wkst: rruleInput.wkst == null
      ? (dateEnv.weekDow - 1 + 7) % 7 // convert Sunday-first to Monday-first
      : convertConstant(rruleInput.wkst),
    byweekday: convertConstants(rruleInput.byweekday),
  }

  return { rrule: new RRule(rruleOptions), isTimeSpecified, isTimeZoneSpecified }
}

function parseRRuleString(str) {
  let rruleSet = rrulestr(str, { forceset: true }) as RRuleSet
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

  str.replace(/\b(DTSTART:)([^\n]*)/, processMatch)
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
    return RRule[input.toUpperCase()]
  }
  return input
}
