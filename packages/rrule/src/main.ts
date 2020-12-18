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
  rrule: RRule
  isTimeZoneSpecified: boolean
}

let recurring: RecurringType<RRuleParsed> = {

  parse(refined: EventRefined, dateEnv: DateEnv) {
    if (refined.rrule != null) {
      let parsed = parseRRule(refined.rrule, dateEnv)

      if (parsed) {
        return {
          typeData: { rrule: parsed.rrule, isTimeZoneSpecified: parsed.isTimeZoneSpecified },
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
      dates = parsed.rrule.between(
        dateEnv.toDate(framingRange.start), // rrule lib will treat as UTC-zoned
        dateEnv.toDate(framingRange.end), // (same)
        true, // inclusive (will give extra events at start, see https://github.com/jakubroztocil/rrule/issues/84)
      ).map((date) => dateEnv.createMarker(date)) // convert UTC-zoned-date to locale datemarker
    } else {
      // when no timezone in given start/end, the rrule lib will assume UTC,
      // which is same as our DateMarkers. no need to manipulate
      dates = parsed.rrule.between(
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
  let isTimeSpecified = false
  let isTimeZoneSpecified = false
  let rrule

  if (typeof input === 'string') {
    rrule = rrulestr(input)

    let result = analyzeRRuleString(input)
    isTimeSpecified = result.isTimeSpecified
    isTimeZoneSpecified = result.isTimeZoneSpecified
  } else if (typeof input === 'object' && input) { // non-null object
    let refined = { ...input } // copy
    delete refined.exdates
    delete refined.exrules

    if (typeof refined.dtstart === 'string') {
      let result = parseMarker(refined.dtstart)

      // TODO: not DRY
      if (result) {
        isTimeSpecified = isTimeSpecified || !result.isTimeUnspecified
        isTimeZoneSpecified = isTimeZoneSpecified || result.timeZoneOffset !== null
        refined.dtstart = new Date(result.marker.valueOf() - (result.timeZoneOffset || 0) * 60 * 1000)
      } else { // invalid
        delete refined.dtstart // best idea?
      }
    }

    if (typeof refined.until === 'string') {
      let result = parseMarker(refined.until)

      // TODO: not DRY
      if (result) {
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

    rrule = new RRule(refined)

    if (input.exdates || input.exrules) {
      const exdates: [] = input.exdates instanceof Array ? input.exdates : []
      const exrules: [] = input.exrules instanceof Array ? input.exrules : []

      const rruleSet = new RRuleSet()
      rruleSet.rrule(rrule)

      for (let exrule of exrules) {
        const rruleObj = parseRRule(exrule, dateEnv)
        if (rruleObj && rruleObj.rrule) {
          rruleSet.exrule(rruleObj.rrule)
        }
      }

      for (let exdate of exdates) {
        rruleSet.exdate(exdate)
      }

      rrule = rruleSet
    }
  }

  if (rrule) {
    return { rrule, isTimeSpecified, isTimeZoneSpecified }
  }

  return null
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
