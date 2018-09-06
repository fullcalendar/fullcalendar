import Calendar from '../Calendar'
import { EventInput, EventDef } from './event'
import { DateRange } from '../datelib/date-range'
import { DateEnv } from '../datelib/env'

/*
The plugin system for defining how a recurring event is expanded into individual instances.
*/

export interface ParsedRecurring {
  isAllDay: boolean
  hasEnd: boolean
  typeData: any
}

export interface RecurringType {
  parse: (rawEvent: EventInput, leftoverProps: any, dateEnv: DateEnv) => ParsedRecurring | null
  expand: (typeData: any, eventDef: EventDef, framingRange: DateRange, calendar: Calendar) => DateRange[]
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
        hasEnd: parsed.hasEnd,
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
export function expandRecurringRanges(eventDef: EventDef, framingRange: DateRange, calendar: Calendar): DateRange[] {
  let typeDef = recurringTypes[eventDef.recurringDef.typeId]

  return typeDef.expand(
    eventDef.recurringDef.typeData,
    eventDef,
    framingRange,
    calendar
  )
}
