import { RRule, rrulestr } from 'rrule'
import { registerRecurringType, ParsedRecurring, EventInput, refineProps, DateEnv, EventDef, DateRange, DateMarker, DateMarkerMeta, createDuration } from 'fullcalendar'

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
    let dtstartMeta: DateMarkerMeta

    let refined = refineProps(input, {
      dtstart: null,
      until: null,
      freq: convertConstant,
      wkst: convertConstant,
      byweekday: convertConstants
    })

    if (typeof refined.dtstart === 'string') {
      dtstartMeta = dateEnv.createMarkerMeta(refined.dtstart)
      refined.dtstart = dtstartMeta ? dtstartMeta.marker : null
    }

    if (typeof refined.until === 'string') {
      refined.until = dateEnv.createMarker(refined.until)
    }

    return {
      rrule: new RRule(refined),
      isAllDay: dtstartMeta && dtstartMeta.isTimeUnspecified
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
