import Calendar from '../Calendar'
import { EventInput, EventDef } from './event'
import { DateRange } from '../datelib/date-range'

/*
The plugin system for defining how a recurring event is expanded into individual instances.
*/

export interface ParsedRecurring {
  isAllDay: boolean
  hasEnd: boolean
  typeData: any
}

export interface IddParsedRecurring extends ParsedRecurring {
  typeId: number
}

export interface RecurringType {
  parse: (rawEvent: EventInput, leftoverProps: any) => ParsedRecurring | null
  expand: (typeData: any, eventDef: EventDef, framingRange: DateRange, calendar: Calendar) => DateRange[]
}


let recurringTypes: RecurringType[] = []

export function registerRecurringType(recurringType: RecurringType) {
  recurringTypes.push(recurringType)
}


export function parseEventDefRecurring(eventInput: EventInput, leftovers: any): IddParsedRecurring | null {
  for (let i = 0; i < recurringTypes.length; i++) {
    let parsed = recurringTypes[i].parse(eventInput, leftovers) as IddParsedRecurring

    if (parsed) {
      parsed.typeId = i
      return parsed
    }
  }

  return null
}


export function expandEventDef(eventDef: EventDef, framingRange: DateRange, calendar: Calendar) {
  let typeDef = recurringTypes[eventDef.recurringDef.typeId]

  return typeDef.expand(
    eventDef.recurringDef.typeData,
    eventDef,
    framingRange,
    calendar
  )
}
