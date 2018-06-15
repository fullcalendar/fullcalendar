import Calendar from '../Calendar'
import { EventRenderRange, sliceEventRanges } from '../reducers/event-rendering'
import UnzonedRange from '../models/UnzonedRange'
import { EventInput } from './event-store'
import { assignTo } from '../util/object'
import { expandRecurring } from './recurring-events'
import { parseDef, createInstance } from './event-store'

export type BusinessHourDef = true | EventInput | EventInput[] // TODO: rename to plural?

const BUSINESS_HOUR_EVENT_DEFAULTS = {
  startTime: '09:00',
  endTime: '17:00',
  daysOfWeek: [ 1, 2, 3, 4, 5 ], // monday - friday
  rendering: 'inverse-background',
  groupId: 'business-hours', // for inverse-rendering
  className: 'fc-nonbusiness'
}


export function buildBusinessHourEventRenderRanges(
  input: BusinessHourDef,
  isAllDay: boolean,
  framingRange: UnzonedRange,
  calendar: Calendar
): EventRenderRange[] {
  let eventRanges = buildBusinessHourEventRanges(input, isAllDay, framingRange, calendar)

  return sliceEventRanges(eventRanges, framingRange)
}


export function buildBusinessHourEventRanges(
  input: BusinessHourDef,
  isAllDay: boolean,
  framingRange: UnzonedRange,
  calendar: Calendar
): EventRenderRange[] {
  let eventInputs = refineEventInputs(input, isAllDay)
  let eventRanges: EventRenderRange[] = []

  for (let eventInput of eventInputs) {
    let dateInfo = expandRecurring(eventInput, framingRange, calendar)
    let def = parseDef(eventInput, null, isAllDay, true)

    for (let range of dateInfo.ranges) {
      let instance = createInstance(def.defId, range)

      eventRanges.push({
        eventDef: def,
        eventInstance: instance,
        range
      })
    }
  }

  return eventRanges
}


function refineEventInputs(input: BusinessHourDef, isAllDay: boolean): EventInput[] {
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
