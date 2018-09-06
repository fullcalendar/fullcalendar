import { RRule, rrulestr } from 'rrule'
import { registerRecurringType, ParsedRecurring, EventInput, refineProps, DateEnv, EventDef, DateRange, Calendar, DateMarker } from 'fullcalendar'

interface RRuleParsedRecurring extends ParsedRecurring {
  typeData: RRule
}

registerRecurringType({

  parse(rawEvent: EventInput, leftoverProps: any, dateEnv: DateEnv): RRuleParsedRecurring | null {
    if (rawEvent.rrule != null) {

      let rrule = parseRRule(rawEvent.rrule, dateEnv)

      if (rrule) {
        // put all other props (except rrule) in leftoverProps
        // TODO: should still remove the rrule prop even if failure?
        refineProps(rawEvent, { rrule: null }, {}, leftoverProps)

        return {
          isAllDay: false, // TODO!!!
          hasEnd: true, // TODO!!!
          typeData: rrule
        }
      }
    }

    return null
  },

  // TODO: what about duration?!!
  expand(rrule: RRule, eventDef: EventDef, framingRange: DateRange, calendar: Calendar): DateRange[] {
    let dateEnv = calendar.dateEnv
    let duration = calendar.defaultTimedEventDuration
    let markers = rrule.between(framingRange.start, framingRange.end)

    return markers.map(function(marker: DateMarker) {
      return {
        start: marker,
        end: dateEnv.add(marker, duration)
      }
    })
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
