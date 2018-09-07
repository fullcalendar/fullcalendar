import { RRule, rrulestr } from 'rrule'
import { registerRecurringType, ParsedRecurring, EventInput, refineProps, DateEnv, EventDef, DateRange, DateMarker, createDuration } from 'fullcalendar'

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
      let rrule = parseRRule(props.rrule, dateEnv)

      if (rrule) {
        return {
          isAllDay: false, // TODO!!!
          duration: props.duration,
          typeData: rrule
        }
      }
    }

    return null
  },

  expand(rrule: RRule, eventDef: EventDef, framingRange: DateRange): DateMarker[] {
    return rrule.between(framingRange.start, framingRange.end)
  }

})

function parseRRule(input, dateEnv: DateEnv): RRule | null {

  if (typeof input === 'string') {
    return rrulestr(input)

  } else if (typeof input === 'object' && input) { // non-null object

    let parseMarker = function(val) {
      if (typeof val === 'string') {
        let marker = dateEnv.createMarker(val)
        if (marker) {
          return marker
        }
      }
      return val
    }

    let refined = refineProps(input, {
      dtstart: parseMarker,
      until: parseMarker,
      freq: convertConstant,
      wkst: convertConstant,
      byweekday: convertConstants
    })

    return new RRule(refined)
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
