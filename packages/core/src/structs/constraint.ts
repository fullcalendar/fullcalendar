import { EventStore, parseEvents } from './event-store'
import { EventInput } from './event-parse'
import { DateSpanApi } from './date-span'
import { EventApi } from '../api/EventApi'
import { SplittableProps } from '../component/event-splitting'
import { CalendarContext } from '../CalendarContext'

// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | EventInput | EventInput[]
export type Constraint = 'businessHours' | string | EventStore | false // false means won't pass at all
export type OverlapFunc = ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type AllowFunc = (span: DateSpanApi, movingEvent: EventApi | null) => boolean
export type isPropsValidTester = (props: SplittableProps, context: CalendarContext) => boolean

export function normalizeConstraint(input: ConstraintInput, context: CalendarContext): Constraint | null {
  if (Array.isArray(input)) {
    return parseEvents(input, null, context, true) // allowOpenRange=true
  } if (typeof input === 'object' && input) { // non-null object
    return parseEvents([input], null, context, true) // allowOpenRange=true
  } if (input != null) {
    return String(input)
  }
  return null
}
