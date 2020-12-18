import { RRule, RRuleSet, rrulestr } from 'rrule'
import {
  RecurringType,
  EventRefined,
  DateEnv,
  DateRange,
  DateMarker,
  createPlugin,
  parseMarker,
} from '@fullcalendar/common'
import { RRULE_EVENT_REFINERS } from './event-refiners'
import './event-declare'

interface RRuleParsed {
  rruleSet: RRuleSet
  isTimeZoneSpecified: boolean
}

let recurring: RecurringType<RRuleParsed> = {

  parse(refined: EventRefined, dateEnv: DateEnv) {
    if (refined.rrule != null) {
      let parsed = parseRRule(refined.rrule, dateEnv)

      if (parsed) {
        return {
          typeData: { rruleSet: parsed.rruleSet, isTimeZoneSpecified: parsed.isTimeZoneSpecified },
          allDayGuess: !parsed.isTimeSpecified,
          duration: refined.duration,
        }
      }
    }

    return null
  },

  expand(parsed: RRuleParsed, framingRange: DateRange, dateEnv: DateEnv): DateMarker[] {
    let dates: DateMarker[]

    if (parsed.isTimeZoneSpecified) {
      dates = parsed.rruleSet.between(
        dateEnv.toDate(framingRange.start), // rrule lib will treat as UTC-zoned
        dateEnv.toDate(framingRange.end), // (same)
        true, // inclusive (will give extra events at start, see https://github.com/jakubroztocil/rrule/issues/84)
      ).map((date) => dateEnv.createMarker(date)) // convert UTC-zoned-date to locale datemarker
    } else {
      // when no timezone in given start/end, the rrule lib will assume UTC,
      // which is same as our DateMarkers. no need to manipulate
      dates = parsed.rruleSet.between(
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

function parseRRule(input, dateEnv: DateEnv) {
  if (typeof input === 'string') {
    return parseRRuleSetString(input)
  } else if (typeof input === 'object' && input) { // non-null object
    return parseRRuleSetObject(input, dateEnv)
  }

  return null
}

function parseRRuleSetObject(input, dateEnv: DateEnv) {
  let { rrule, isTimeSpecified, isTimeZoneSpecified } = parseRRuleObject(input, dateEnv)
  let exdateInputs: any[] = [].concat(input.exdate || []) // convert to array
  let exruleInputs: any[] = [].concat(input.exrule || []) // convert to array
  let rruleSet = new RRuleSet()

  rruleSet.rrule(rrule)

  for (let exdateInput of exdateInputs) {
    let exdateRes = parseMarker(exdateInput)

    // TODO: not DRY
    isTimeSpecified = isTimeSpecified || !exdateRes.isTimeUnspecified
    isTimeZoneSpecified = isTimeZoneSpecified || exdateRes.timeZoneOffset !== null
    rruleSet.exdate(
      new Date(exdateRes.marker.valueOf() - (exdateRes.timeZoneOffset || 0) * 60 * 1000)
    )
  }

  // TODO: exrule is deprecated. what to do? (https://icalendar.org/iCalendar-RFC-5545/a-3-deprecated-features.html)
  for (let exruleInput of exruleInputs) {
    let exruleRes = parseRRuleObject(exruleInput, dateEnv)

    isTimeSpecified = isTimeSpecified || exruleRes.isTimeSpecified
    isTimeZoneSpecified = isTimeZoneSpecified || exruleRes.isTimeZoneSpecified

    rruleSet.exrule(exruleRes.rrule)
  }

  return { rruleSet, isTimeSpecified, isTimeZoneSpecified }
}

function parseRRuleObject(input, dateEnv: DateEnv) {
  let isTimeSpecified = false
  let isTimeZoneSpecified = false
  let refined = { ...input } // copy

  // TODO: weird to blacklist these here
  delete refined.exdates
  delete refined.exrules

  if (typeof refined.dtstart === 'string') {
    let result = parseMarker(refined.dtstart)

    if (result) {
      // TODO: not DRY
      isTimeSpecified = isTimeSpecified || !result.isTimeUnspecified
      isTimeZoneSpecified = isTimeZoneSpecified || result.timeZoneOffset !== null
      refined.dtstart = new Date(result.marker.valueOf() - (result.timeZoneOffset || 0) * 60 * 1000)
    } else { // invalid
      delete refined.dtstart // best idea?
    }
  }

  if (typeof refined.until === 'string') {
    let result = parseMarker(refined.until)

    if (result) {
      // TODO: not DRY
      isTimeSpecified = isTimeSpecified || !result.isTimeUnspecified
      isTimeZoneSpecified = isTimeZoneSpecified || result.timeZoneOffset !== null
      refined.until = new Date(result.marker.valueOf() - (result.timeZoneOffset || 0) * 60 * 1000)
    } else { // invalid
      delete refined.until // best idea?
    }
  }

  if (refined.freq != null) {
    refined.freq = convertConstant(refined.freq)
  }

  if (refined.wkst != null) {
    refined.wkst = convertConstant(refined.wkst)
  } else {
    refined.wkst = (dateEnv.weekDow - 1 + 7) % 7 // convert Sunday-first to Monday-first
  }

  if (refined.byweekday != null) {
    refined.byweekday = convertConstants(refined.byweekday) // the plural version
  }

  return {
    rrule: new RRule(refined),
    isTimeSpecified,
    isTimeZoneSpecified,
  }
}

function parseRRuleSetString(str) {
  let rruleSet = rrulestr(str, { forceset: true }) as RRuleSet
  let analysis = analyzeRRuleString(str)

  return { rruleSet, ...analysis }
}

function analyzeRRuleString(str) {
  let isTimeSpecified = false
  let isTimeZoneSpecified = false

  function process(whole: string, introPart: string, datePart: string) {
    // TODO: not DRY
    let result = parseMarker(datePart)
    isTimeSpecified = isTimeSpecified || !result.isTimeUnspecified
    isTimeZoneSpecified = isTimeZoneSpecified || result.timeZoneOffset !== null
  }

  str.replace(/\b(DTSTART:)([^\n]*)/, process)
  str.replace(/\b(EXDATE:)([^\n]*)/, process)
  str.replace(/\b(UNTIL=)([^;]*)/, process)

  return { isTimeSpecified, isTimeZoneSpecified }
}

function convertConstants(input) {
  if (Array.isArray(input)) {
    return input.map(convertConstant)
  }
  return convertConstant(input)
}

function convertConstant(input) {
  if (typeof input === 'string') {
    return RRule[input.toUpperCase()]
  }
  return input
}
