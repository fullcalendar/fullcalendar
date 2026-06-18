import { createDuration, DateInput } from '@full-ui/headless-calendar'
import { identity, Identity } from '../options'

export const SIMPLE_RECURRING_REFINERS = {
  daysOfWeek: identity as Identity<number[]>,
  startTime: createDuration,
  endTime: createDuration,
  duration: createDuration,
  startRecur: identity as Identity<DateInput>,
  endRecur: identity as Identity<DateInput>,
}
