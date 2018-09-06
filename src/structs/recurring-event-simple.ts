import { startOfDay, addDays } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import { arrayToHash } from '../util/object'
import { refineProps } from '../util/misc'
import { registerRecurringType, ParsedRecurring } from './recurring-event'
import Calendar from '../Calendar'
import { EventInput, EventDef } from './event'
import { DateRange } from '../datelib/date-range'

/*
An implementation of recurring events that only supports every-day or weekly recurrences.
*/

const SIMPLE_RECURRING_PROPS = {
  daysOfWeek: null,
  startTime: createDuration,
  endTime: createDuration
}

interface SimpleRecurringData {
  daysOfWeek: number[] | null
  startTime: Duration | null
  endTime: Duration | null
}

interface SimpleParsedRecurring extends ParsedRecurring {
  typeData: SimpleRecurringData // the whole point is to make this more specific
}

registerRecurringType({

  parse(rawEvent: EventInput, leftoverProps: any): SimpleParsedRecurring | null {
    if (
      rawEvent.daysOfWeek ||
      rawEvent.startTime != null ||
      rawEvent.endTime != null
    ) {
      let props = refineProps(rawEvent, SIMPLE_RECURRING_PROPS, {}, leftoverProps) as SimpleRecurringData

      return {
        isAllDay: !props.startTime && !props.endTime,
        hasEnd: Boolean(props.endTime),
        typeData: props
      }
    }

    return null
  },

  expand(typeData: SimpleRecurringData, eventDef: EventDef, framingRange: DateRange, calendar: Calendar): DateRange[] {
    return expandRanges(
      typeData.daysOfWeek,
      typeData.startTime,
      typeData.endTime,
      framingRange,
      calendar
    )
  }

})

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
