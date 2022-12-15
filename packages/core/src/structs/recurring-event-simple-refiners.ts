import { createDuration } from '../datelib/duration.js'
import { DateInput } from '../datelib/env.js'
import { identity, Identity } from '../options.js'

export const SIMPLE_RECURRING_REFINERS = {
  daysOfWeek: identity as Identity<number[]>,
  startTime: createDuration,
  endTime: createDuration,
  duration: createDuration,
  startRecur: identity as Identity<DateInput>,
  endRecur: identity as Identity<DateInput>,
}
