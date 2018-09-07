import { EventInput, EventDef } from './event'
import { DateRange } from '../datelib/date-range'
import { DateEnv } from '../datelib/env'
import { Duration } from '../datelib/duration'
import { DateMarker } from '../datelib/marker'

/*
The plugin system for defining how a recurring event is expanded into individual instances.
*/

export interface ParsedRecurring {
  isAllDay: boolean
  duration: Duration | null // signals hasEnd
  typeData: any
}

export interface RecurringType {
  parse: (rawEvent: EventInput, leftoverProps: any, dateEnv: DateEnv) => ParsedRecurring | null
  expand: (typeData: any, eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv) => DateMarker[]
}


let recurringTypes: RecurringType[] = []

export function registerRecurringType(recurringType: RecurringType) {
  recurringTypes.push(recurringType)
}


export function parseRecurring(eventInput: EventInput, leftovers: any, dateEnv: DateEnv) {
  for (let i = 0; i < recurringTypes.length; i++) {
    let parsed = recurringTypes[i].parse(eventInput, leftovers, dateEnv) as ParsedRecurring

    if (parsed) {
      return {
        isAllDay: parsed.isAllDay,
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
export function expandRecurringRanges(eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv): DateMarker[] {
  let typeDef = recurringTypes[eventDef.recurringDef.typeId]

  return typeDef.expand(
    eventDef.recurringDef.typeData,
    eventDef,
    framingRange,
    dateEnv
  )
}
