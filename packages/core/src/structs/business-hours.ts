import { EventInput } from './event-parse.js'
import { EventStore, parseEvents } from './event-store.js'
import { CalendarContext } from '../CalendarContext.js'

/*
Utils for converting raw business hour input into an EventStore,
for both rendering and the constraint system.
*/

export type BusinessHoursInput = boolean | EventInput | EventInput[]

const DEF_DEFAULTS = {
  startTime: '09:00',
  endTime: '17:00',
  daysOfWeek: [1, 2, 3, 4, 5], // monday - friday
  display: 'inverse-background',
  classNames: 'fc-non-business',
  groupId: '_businessHours', // so multiple defs get grouped
}

/*
TODO: pass around as EventDefHash!!!
*/
export function parseBusinessHours(input: BusinessHoursInput, context: CalendarContext): EventStore {
  return parseEvents(
    refineInputs(input),
    null,
    context,
  )
}

function refineInputs(input: BusinessHoursInput) {
  let rawDefs

  if (input === true) {
    rawDefs = [{}] // will get DEF_DEFAULTS verbatim
  } else if (Array.isArray(input)) {
    // if specifying an array, every sub-definition NEEDS a day-of-week
    rawDefs = input.filter((rawDef) => rawDef.daysOfWeek)
  } else if (typeof input === 'object' && input) { // non-null object
    rawDefs = [input]
  } else { // is probably false
    rawDefs = []
  }

  rawDefs = rawDefs.map((rawDef) => ({ ...DEF_DEFAULTS, ...rawDef }))

  return rawDefs
}
