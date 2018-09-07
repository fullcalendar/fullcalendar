import { RRule, rrulestr } from 'rrule'
import { registerRecurringType, ParsedRecurring, EventInput, refineProps, DateEnv, EventDef, DateRange, DateMarker, createDuration, assignTo } from 'fullcalendar'

interface RRuleParsedRecurring extends ParsedRecurring {
  typeData: RRule
}

const EVENT_DEF_PROPS = {
  rrule: null,
  duration: createDuration
}

registerRecurringType({

  parse(rawEvent: EventInput, leftoverProps: any, dateEnv: DateEnv): RRuleParsedRecurring | null {
    if (rawEvent.rrule != null) {
      let props = refineProps(rawEvent, EVENT_DEF_PROPS, {}, leftoverProps)
      let parsed = parseRRule(props.rrule, dateEnv)

      if (parsed) {
        return {
          isAllDay: parsed.isAllDay,
          duration: props.duration,
          typeData: parsed.rrule
        }
      }
    }

    return null
  },

  expand(rrule: RRule, eventDef: EventDef, framingRange: DateRange): DateMarker[] {
    return rrule.between(framingRange.start, framingRange.end)
  }

})

function parseRRule(input, dateEnv: DateEnv) {

  if (typeof input === 'string') {
    return {
      rrule: rrulestr(input),
      isAllDay: false
    }

  } else if (typeof input === 'object' && input) { // non-null object
    let refined = assignTo({}, input) // copy
    let isAllDay = false

    if (typeof refined.dtstart === 'string') {
      let dtstartMeta = dateEnv.createMarkerMeta(refined.dtstart)

      if (dtstartMeta) {
        refined.dtstart = dtstartMeta.marker
        isAllDay = dtstartMeta.isTimeUnspecified
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

    return {
      rrule: new RRule(refined),
      isAllDay
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
