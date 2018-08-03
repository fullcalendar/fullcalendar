import Calendar from '../Calendar'
import { EventInput } from './event'
import { DateRange } from '../datelib/date-range'

/*
The plugin system for defining how a recurring event is expanded into individual instances.
*/

export interface RecurringEventDateSpans {
  isAllDay: boolean
  hasEnd: boolean
  ranges: DateRange[]
}

export type RecurringExpander = (
  rawEvent: EventInput,
  range: DateRange,
  calendar: Calendar,
  leftovers: object
) => RecurringEventDateSpans | null


let recurringExpanders: RecurringExpander[] = []

export function registerRecurringExpander(expander: RecurringExpander) {
  recurringExpanders.push(expander)
}

export function expandRecurring(
  rawEvent: EventInput,
  range: DateRange,
  calendar: Calendar,
  leftovers?: object
): RecurringEventDateSpans | null {
  for (let expander of recurringExpanders) {
    let dateInfo = expander(rawEvent, range, calendar, leftovers || {})

    if (dateInfo) {
      return dateInfo
    }
  }

  return null
}
