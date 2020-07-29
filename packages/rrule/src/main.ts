import { RRule, rrulestr } from 'rrule'
import {
  RecurringType,
  EventRefined,
  DateEnv,
  DateRange,
  DateMarker,
  createPlugin
} from '@fullcalendar/common'
import { RRULE_EVENT_REFINERS } from './event-refiners'
import './event-declare'


let recurring: RecurringType<RRule> = {

  parse(refined: EventRefined, dateEnv: DateEnv) {

    if (refined.rrule != null) {
      let parsed = parseRRule(refined.rrule, dateEnv)

      if (parsed) {
        return {
          typeData: parsed.rrule,
          allDayGuess: parsed.allDayGuess,
          duration: refined.duration
        }
      }
    }

    return null
  },

  expand(rrule: RRule, framingRange: DateRange): DateMarker[] {
    // we WANT an inclusive start and in exclusive end, but the js rrule lib will only do either BOTH
    // inclusive or BOTH exclusive, which is stupid: https://github.com/jakubroztocil/rrule/issues/84
    // Workaround: make inclusive, which will generate extra occurences, and then trim.
    return rrule.between(framingRange.start, framingRange.end, true)
      .filter(date => date.valueOf() < framingRange.end.valueOf())
  }

}


export default createPlugin({
  recurringTypes: [ recurring ],
  eventRefiners: RRULE_EVENT_REFINERS
})


function parseRRule(input, dateEnv: DateEnv) {
  let allDayGuess = null
  let rrule

  if (typeof input === 'string') {
    rrule = rrulestr(input)

  } else if (typeof input === 'object' && input) { // non-null object
    let refined = { ...input } // copy

    if (typeof refined.dtstart === 'string') {
      let dtstartMeta = dateEnv.createMarkerMeta(refined.dtstart)

      if (dtstartMeta) {
        refined.dtstart = dtstartMeta.marker
        allDayGuess = dtstartMeta.isTimeUnspecified
      } else {
        delete refined.dtstart
      }
    }

    if (typeof refined.until === 'string') {
      refined.until = dateEnv.createMarker(refined.until)
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
  }

  if (rrule) {
    return { rrule, allDayGuess }
  }

  return null
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
