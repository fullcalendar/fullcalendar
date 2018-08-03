import Calendar from '../Calendar'
import UnzonedRange from '../models/UnzonedRange'
import { assignTo } from '../util/object'
import { EventInput } from './event'
import { EventStore, parseEventStore } from './event-store'

/*
*/

export type BusinessHoursDef = boolean | EventInput | EventInput[]

const BUSINESS_HOUR_EVENT_DEFAULTS = {
  startTime: '09:00',
  endTime: '17:00',
  daysOfWeek: [ 1, 2, 3, 4, 5 ], // monday - friday
  rendering: 'inverse-background',
  className: 'fc-nonbusiness'
}

export function buildBusinessHours(
  input: BusinessHoursDef,
  isAllDay: boolean,
  framingRange: UnzonedRange,
  calendar: Calendar
): EventStore {
  return parseEventStore(
    refineInputs(input, isAllDay),
    '',
    framingRange,
    calendar
  )
}

function refineInputs(input: BusinessHoursDef, isAllDay: boolean): EventInput[] {
  let rawDefs: EventInput[]

  if (input === true) {
    rawDefs = [ {} ] // will get BUSINESS_HOUR_EVENT_DEFAULTS verbatim
  } else if (Array.isArray(input)) {
    // if specifying an array, every sub-definition NEEDS a day-of-week
    rawDefs = input.filter(function(rawDef) {
      return rawDef.daysOfWeek
    })
  } else if (typeof input === 'object' && input) { // non-null object
    rawDefs = [ input ]
  } else {
    rawDefs = []
  }

  rawDefs = rawDefs.map(function(rawDef) {
    rawDef = assignTo({}, BUSINESS_HOUR_EVENT_DEFAULTS, rawDef)

    if (isAllDay) {
      rawDef.startTime = null
      rawDef.endTime = null
    }

    return rawDef
  })

  return rawDefs
}
