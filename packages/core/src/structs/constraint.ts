import { EventStore, parseEvents } from './event-store'
import { EventInput } from './event'
import { DateSpanApi } from './date-span'
import { EventApi } from '../api/EventApi'
import { SplittableProps } from '../component/event-splitting'
import { ReducerContext } from '../reducers/ReducerContext'


// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | EventInput | EventInput[]
export type Constraint = 'businessHours' | string | EventStore | false // false means won't pass at all
export type OverlapFunc = ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type AllowFunc = (span: DateSpanApi, movingEvent: EventApi | null) => boolean
export type isPropsValidTester = (props: SplittableProps, context: ReducerContext) => boolean


export function normalizeConstraint(input: ConstraintInput, context: ReducerContext): Constraint | null {
  if (Array.isArray(input)) {
    return parseEvents(input, '', context, true) // allowOpenRange=true

  } else if (typeof input === 'object' && input) { // non-null object
    return parseEvents([ input ], '', context, true) // allowOpenRange=true

  } else if (input != null) {
    return String(input)

  } else {
    return null
  }
}
