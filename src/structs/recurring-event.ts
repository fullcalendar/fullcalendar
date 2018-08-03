import UnzonedRange from '../models/UnzonedRange'
import Calendar from '../Calendar'
import { EventInput } from './event'

/*
*/

export interface RecurringEventDateSpans {
  isAllDay: boolean
  hasEnd: boolean
  ranges: UnzonedRange[]
}

export type RecurringExpander = (
  rawEvent: EventInput,
  range: UnzonedRange,
  calendar: Calendar,
  leftovers: object
) => RecurringEventDateSpans | null

let recurringExpanders: RecurringExpander[] = []

export function expandRecurring(
  rawEvent: EventInput,
  range: UnzonedRange,
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

export function registerRecurringExpander(expander: RecurringExpander) {
  recurringExpanders.push(expander)
}
