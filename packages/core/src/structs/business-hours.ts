import Calendar from '../Calendar'

import { EventInput } from './event'
import { EventStore, parseEvents } from './event-store'

/*
Utils for converting raw business hour input into an EventStore,
for both rendering and the constraint system.
*/

export type BusinessHoursInput = boolean | EventInput | EventInput[]

const DEF_DEFAULTS = {
  startTime: '09:00',
  endTime: '17:00',
  daysOfWeek: [ 1, 2, 3, 4, 5 ], // monday - friday
  rendering: 'inverse-background',
  classNames: 'fc-nonbusiness',
  groupId: '_businessHours' // so multiple defs get grouped
}

/*
TODO: pass around as EventDefHash!!!
*/
export function parseBusinessHours(input: BusinessHoursInput, calendar: Calendar): EventStore {
  return parseEvents(
    refineInputs(input),
    '',
    calendar
  )
}

function refineInputs(input: BusinessHoursInput) {
  let rawDefs

  if (input === true) {
    rawDefs = [ {} ] // will get DEF_DEFAULTS verbatim
  } else if (Array.isArray(input)) {
    // if specifying an array, every sub-definition NEEDS a day-of-week
    rawDefs = input.filter(function(rawDef) {
      return rawDef.daysOfWeek
    })
  } else if (typeof input === 'object' && input) { // non-null object
    rawDefs = [ input ]
  } else { // is probably false
    rawDefs = []
  }

  rawDefs = rawDefs.map(function(rawDef) {
    return { ...DEF_DEFAULTS, ...rawDef }
  })

  return rawDefs
}
