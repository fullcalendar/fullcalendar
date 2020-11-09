import { startOfDay, addDays, DateMarker } from '../datelib/marker'
import { Duration, subtractDurations } from '../datelib/duration'
import { arrayToHash } from '../util/object'
import { RecurringType } from './recurring-event'
import { EventRefined } from './event-parse'
import { DateRange, intersectRanges } from '../datelib/date-range'
import { DateEnv } from '../datelib/env'
import { createPlugin } from '../plugin-system'
import { SIMPLE_RECURRING_REFINERS } from './recurring-event-simple-refiners'
import './recurring-event-simple-declare'

/*
An implementation of recurring events that only supports every-day or weekly recurrences.
*/

interface SimpleRecurringData {
  daysOfWeek: number[] | null
  startTime: Duration | null
  endTime: Duration | null
  startRecur: DateMarker | null
  endRecur: DateMarker | null
}

let recurring: RecurringType<SimpleRecurringData> = {

  parse(refined: EventRefined, dateEnv: DateEnv) {
    if (refined.daysOfWeek || refined.startTime || refined.endTime || refined.startRecur || refined.endRecur) {
      let recurringData: SimpleRecurringData = {
        daysOfWeek: refined.daysOfWeek || null,
        startTime: refined.startTime || null,
        endTime: refined.endTime || null,
        startRecur: refined.startRecur ? dateEnv.createMarker(refined.startRecur) : null,
        endRecur: refined.endRecur ? dateEnv.createMarker(refined.endRecur) : null,
      }

      let duration: Duration

      if (refined.duration) {
        duration = refined.duration
      }
      if (!duration && refined.startTime && refined.endTime) {
        duration = subtractDurations(refined.endTime, refined.startTime)
      }

      return {
        allDayGuess: Boolean(!refined.startTime && !refined.endTime),
        duration,
        typeData: recurringData, // doesn't need endTime anymore but oh well
      }
    }

    return null
  },

  expand(typeData: SimpleRecurringData, framingRange: DateRange, dateEnv: DateEnv): DateMarker[] {
    let clippedFramingRange = intersectRanges(
      framingRange,
      { start: typeData.startRecur, end: typeData.endRecur },
    )

    if (clippedFramingRange) {
      return expandRanges(
        typeData.daysOfWeek,
        typeData.startTime,
        clippedFramingRange,
        dateEnv,
      )
    }
    return []
  },

}

export const simpleRecurringEventsPlugin = createPlugin({
  recurringTypes: [recurring],
  eventRefiners: SIMPLE_RECURRING_REFINERS,
})

function expandRanges(
  daysOfWeek: number[] | null,
  startTime: Duration | null,
  framingRange: DateRange,
  dateEnv: DateEnv,
): DateMarker[] {
  let dowHash: { [num: string]: true } | null = daysOfWeek ? arrayToHash(daysOfWeek) : null
  let dayMarker = startOfDay(framingRange.start)
  let endMarker = framingRange.end
  let instanceStarts: DateMarker[] = []

  while (dayMarker < endMarker) {
    let instanceStart

    // if everyday, or this particular day-of-week
    if (!dowHash || dowHash[dayMarker.getUTCDay()]) {
      if (startTime) {
        instanceStart = dateEnv.add(dayMarker, startTime)
      } else {
        instanceStart = dayMarker
      }

      instanceStarts.push(instanceStart)
    }

    dayMarker = addDays(dayMarker, 1)
  }

  return instanceStarts
}
