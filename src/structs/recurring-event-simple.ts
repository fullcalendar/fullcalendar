import { startOfDay, addDays, DateMarker } from '../datelib/marker'
import { Duration, createDuration, subtractDurations } from '../datelib/duration'
import { arrayToHash } from '../util/object'
import { refineProps } from '../util/misc'
import { registerRecurringType, ParsedRecurring } from './recurring-event'
import { EventInput, EventDef } from './event'
import { DateRange } from '../datelib/date-range'
import { DateEnv } from '../datelib/env'

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
        allDay: !props.startTime && !props.endTime,
        duration: (props.startTime && props.endTime) ?
          subtractDurations(props.endTime, props.startTime) :
          null,
        typeData: props // doesn't need endTime anymore but oh well
      }
    }

    return null
  },

  expand(typeData: SimpleRecurringData, eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv): DateMarker[] {
    return expandRanges(
      typeData.daysOfWeek,
      typeData.startTime,
      framingRange,
      dateEnv
    )
  }

})

function expandRanges(
  daysOfWeek: number[] | null,
  startTime: Duration | null,
  framingRange: DateRange,
  dateEnv: DateEnv
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
