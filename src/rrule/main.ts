import { RRule, rrulestr } from 'rrule'
import {
  RecurringType,
  ParsedRecurring,
  EventInput,
  refineProps,
  DateEnv,
  EventDef,
  DateRange,
  DateMarker,
  createDuration,
  createPlugin
} from '@fullcalendar/core'

interface RRuleParsedRecurring extends ParsedRecurring {
  typeData: RRule
}

const EVENT_DEF_PROPS = {
  rrule: null,
  duration: createDuration
}

let recurring: RecurringType = {

  parse(rawEvent: EventInput, allDayDefault: boolean | null, leftoverProps: any, dateEnv: DateEnv): RRuleParsedRecurring | null {
    if (rawEvent.rrule != null) {
      let props = refineProps(rawEvent, EVENT_DEF_PROPS, {}, leftoverProps)
      let parsed = parseRRule(props.rrule, allDayDefault, dateEnv)

      if (parsed) {
        return {
          allDay: parsed.allDay,
          duration: props.duration,
          typeData: parsed.rrule
        }
      }
    }

    return null
  },

  expand(rrule: RRule, eventDef: EventDef, framingRange: DateRange): DateMarker[] {
    // we WANT an inclusive start and in exclusive end, but the js rrule lib will only do either BOTH
    // inclusive or BOTH exclusive, which is stupid: https://github.com/jakubroztocil/rrule/issues/84
    // Workaround: make inclusive, which will generate extra occurences, and then trim.
    return rrule.between(framingRange.start, framingRange.end, true)
      .filter(function(date) {
        return date.valueOf() < framingRange.end.valueOf()
      })
  }

}

export default createPlugin({
  recurringTypes: [ recurring ]
})

function parseRRule(input, allDayDefault: boolean | null, dateEnv: DateEnv) {

  if (typeof input === 'string') {
    return {
      rrule: rrulestr(input),
      allDay: false
    }

  } else if (typeof input === 'object' && input) { // non-null object
    let refined = { ...input } // copy
    let allDay = allDayDefault

    if (typeof refined.dtstart === 'string') {
      let dtstartMeta = dateEnv.createMarkerMeta(refined.dtstart)

      if (dtstartMeta) {
        refined.dtstart = dtstartMeta.marker
        allDay = dtstartMeta.isTimeUnspecified
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

    if (allDay == null) { // if not specific event after allDayDefault
      allDay = true
    }

    return {
      rrule: new RRule(refined),
      allDay
    }
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
