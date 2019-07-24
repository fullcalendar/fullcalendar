import { EventInput, EventDef } from './event'
import { DateRange } from '../datelib/date-range'
import { DateEnv } from '../datelib/env'
import { Duration } from '../datelib/duration'
import { DateMarker, startOfDay } from '../datelib/marker'
import { __assign } from 'tslib'

/*
The plugin system for defining how a recurring event is expanded into individual instances.
*/

export interface ParsedRecurring {
  typeData: any
  allDayGuess: boolean | null
  duration: Duration | null // signals hasEnd
}

export interface RecurringType {
  parse: (rawEvent: EventInput, leftoverProps: any, dateEnv: DateEnv) => ParsedRecurring | null
  expand: (typeData: any, framingRange: DateRange, dateEnv: DateEnv) => DateMarker[]
}


export function parseRecurring(
  eventInput: EventInput,
  allDayDefault: boolean | null,
  dateEnv: DateEnv,
  recurringTypes: RecurringType[],
  leftovers: any
) {
  for (let i = 0; i < recurringTypes.length; i++) {
    let localLeftovers = {} as any
    let parsed = recurringTypes[i].parse(eventInput, localLeftovers, dateEnv) as ParsedRecurring

    if (parsed) {

      let allDay = localLeftovers.allDay
      delete localLeftovers.allDay // remove from leftovers
      if (allDay == null) {
        allDay = allDayDefault
        if (allDay == null) {
          allDay = parsed.allDayGuess
          if (allDay == null) {
            allDay = false
          }
        }
      }

      __assign(leftovers, localLeftovers)

      return {
        allDay,
        duration: parsed.duration,
        typeData: parsed.typeData,
        typeId: i
      }

    }
  }

  return null
}


/*
Event MUST have a recurringDef
*/
export function expandRecurringRanges(
  eventDef: EventDef,
  duration: Duration,
  framingRange: DateRange,
  dateEnv: DateEnv,
  recurringTypes: RecurringType[]
): DateMarker[] {
  let typeDef = recurringTypes[eventDef.recurringDef.typeId]
  let markers = typeDef.expand(
    eventDef.recurringDef.typeData,
    {
      start: dateEnv.subtract(framingRange.start, duration), // for when event starts before framing range and goes into
      end: framingRange.end
    },
    dateEnv
  )

  // the recurrence plugins don't guarantee that all-day events are start-of-day, so we have to
  if (eventDef.allDay) {
    markers = markers.map(startOfDay)
  }

  return markers
}
