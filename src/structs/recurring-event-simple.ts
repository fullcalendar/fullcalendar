import { startOfDay, addDays } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import { arrayToHash } from '../util/object'
import { refineProps } from '../util/misc'
import { registerRecurringExpander, RecurringEventDateSpans } from './recurring-event'
import Calendar from '../Calendar'
import { EventInput } from './event'
import { DateRange } from '../datelib/date-range'

/*
An implementation of recurring events that only supports every-day or weekly recurrences.
*/

const SIMPLE_RECURRING_PROPS = {
  daysOfWeek: null,
  startTime: createDuration,
  endTime: createDuration
}

registerRecurringExpander(
  function(rawEvent: EventInput, framingRange: DateRange, calendar: Calendar, leftoverProps: object): RecurringEventDateSpans | null {
    if (
      rawEvent.daysOfWeek ||
      rawEvent.startTime != null ||
      rawEvent.endTime != null
    ) {
      let props = refineProps(rawEvent, SIMPLE_RECURRING_PROPS, {}, leftoverProps)

      return {
        isAllDay: !props.startTime && !props.endTime,
        hasEnd: Boolean(props.endTime),
        ranges: expandRanges(
          props.daysOfWeek,
          props.startTime,
          props.endTime,
          framingRange,
          calendar
        )
      }
    }

    return null
  }
)

function expandRanges(
  daysOfWeek: number[] | null,
  startTime: Duration | null,
  endTime: Duration | null,
  framingRange: DateRange,
  calendar: Calendar
): DateRange[] {
  let dateEnv = calendar.dateEnv
  let dowHash: { [num: string]: true } | null = daysOfWeek ? arrayToHash(daysOfWeek) : null
  let dayMarker = startOfDay(framingRange.start)
  let endMarker = framingRange.end
  let instanceRanges = []

  while (dayMarker < endMarker) {
    let instanceStart
    let instanceEnd

    // if everyday, or this particular day-of-week
    if (!dowHash || dowHash[dayMarker.getUTCDay()]) {

      if (startTime) {
        instanceStart = dateEnv.add(dayMarker, startTime)
      } else {
        instanceStart = dayMarker
      }

      if (endTime) {
        instanceEnd = dateEnv.add(dayMarker, endTime)
      } else {
        instanceEnd = dateEnv.add(
          instanceStart,
          startTime ? // a timed event?
            calendar.defaultTimedEventDuration :
            calendar.defaultAllDayEventDuration
        )
      }

      instanceRanges.push({ start: instanceStart, end: instanceEnd })
    }

    dayMarker = addDays(dayMarker, 1)
  }

  return instanceRanges
}
