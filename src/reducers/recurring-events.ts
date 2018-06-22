import { startOfDay, addDays } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import UnzonedRange from '../models/UnzonedRange'
import Calendar from '../Calendar'
import { arrayToHash } from '../util/object'
import { refineProps } from './utils'
import { EventInput } from './event-store'

// types

export interface RecurringEventDateInfo {
  isAllDay: boolean
  hasEnd: boolean
  ranges: UnzonedRange[]
}

export type RecurringExpandFunc = (
  rawEvent: EventInput,
  range: UnzonedRange,
  calendar: Calendar,
  leftoverProps: object
) => RecurringEventDateInfo

// vars

const SIMPLE_RECURRING_PROPS = {
  daysOfWeek: null,
  startTime: createDuration,
  endTime: createDuration
}

let recurringTypes: { [recurringType: string]: RecurringExpandFunc } = {}

// expanding API

export function expandRecurring(rawEvent: EventInput, range: UnzonedRange, calendar: Calendar, leftoverProps?: object): RecurringEventDateInfo {
  for (let recurringType in recurringTypes) {
    let expandFunc = recurringTypes[recurringType]
    let dateInfo = expandFunc(rawEvent, range, calendar, leftoverProps || {})

    if (dateInfo) {
      return dateInfo
    }
  }
}

export function registerRecurringType(recurringType: string, func: RecurringExpandFunc) {
  recurringTypes[recurringType] = func
}

// simple expanding

registerRecurringType(
  'simple',
  function(rawEvent: EventInput, range: UnzonedRange, calendar: Calendar, leftoverProps: object): RecurringEventDateInfo {
    if (
      rawEvent.daysOfWeek ||
      rawEvent.startTime != null ||
      rawEvent.endTime != null
    ) {
      let refinedProps = refineProps(rawEvent, SIMPLE_RECURRING_PROPS, leftoverProps)

      return {
        isAllDay: !refinedProps.startTime && !refinedProps.endTime,
        hasEnd: Boolean(refinedProps.endTime),
        ranges: expandSimple(
          refinedProps.daysOfWeek,
          refinedProps.startTime,
          refinedProps.endTime,
          range,
          calendar
        )
      }
    }
  }
)

function expandSimple(daysOfWeek: any, startTime: Duration, endTime: Duration, range: UnzonedRange, calendar: Calendar): UnzonedRange[] {
  let dateEnv = calendar.dateEnv
  let dowHash = daysOfWeek ? arrayToHash(daysOfWeek) : null
  let dayMarker = startOfDay(range.start)
  let endMarker = range.end
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

      instanceRanges.push(new UnzonedRange(instanceStart, instanceEnd))
    }

    dayMarker = addDays(dayMarker, 1)
  }

  return instanceRanges
}
