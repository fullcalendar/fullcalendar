import { preventDefault } from './dom-event'
import { DateMarker, startOfDay, addDays, diffDays, diffDayAndTime } from '../datelib/marker'
import { Duration, asRoughMs, createDuration } from '../datelib/duration'
import { DateEnv } from '../datelib/env'
import { DateRange, OpenDateRange } from '../datelib/date-range'


let guidNumber = 0

export function guid() {
  return String(guidNumber++)
}


/* FullCalendar-specific DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Make the mouse cursor express that an event is not allowed in the current area
export function disableCursor() {
  document.body.classList.add('fc-not-allowed')
}


// Returns the mouse cursor to its original look
export function enableCursor() {
  document.body.classList.remove('fc-not-allowed')
}


/* Selection
----------------------------------------------------------------------------------------------------------------------*/


export function preventSelection(el: HTMLElement) {
  el.classList.add('fc-unselectable')
  el.addEventListener('selectstart', preventDefault)
}


export function allowSelection(el: HTMLElement) {
  el.classList.remove('fc-unselectable')
  el.removeEventListener('selectstart', preventDefault)
}


/* Context Menu
----------------------------------------------------------------------------------------------------------------------*/


export function preventContextMenu(el: HTMLElement) {
  el.addEventListener('contextmenu', preventDefault)
}


export function allowContextMenu(el: HTMLElement) {
  el.removeEventListener('contextmenu', preventDefault)
}


/* Object Ordering by Field
----------------------------------------------------------------------------------------------------------------------*/

export interface OrderSpec {
  field?: string
  order?: number
  func?: (a, b) => boolean
}

export function parseFieldSpecs(input) {
  let specs: OrderSpec[] = []
  let tokens = []
  let i
  let token

  if (typeof input === 'string') {
    tokens = input.split(/\s*,\s*/)
  } else if (typeof input === 'function') {
    tokens = [ input ]
  } else if (Array.isArray(input)) {
    tokens = input
  }

  for (i = 0; i < tokens.length; i++) {
    token = tokens[i]

    if (typeof token === 'string') {
      specs.push(
        token.charAt(0) === '-' ?
          { field: token.substring(1), order: -1 } :
          { field: token, order: 1 }
      )
    } else if (typeof token === 'function') {
      specs.push({ func: token })
    }
  }

  return specs
}


export function compareByFieldSpecs(obj0, obj1, fieldSpecs: OrderSpec[]) {
  let i
  let cmp

  for (i = 0; i < fieldSpecs.length; i++) {
    cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i])
    if (cmp) {
      return cmp
    }
  }

  return 0
}


export function compareByFieldSpec(obj0, obj1, fieldSpec: OrderSpec) {
  if (fieldSpec.func) {
    return fieldSpec.func(obj0, obj1)
  }

  return flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field])
    * (fieldSpec.order || 1)
}


export function flexibleCompare(a, b) {
  if (!a && !b) {
    return 0
  }
  if (b == null) {
    return -1
  }
  if (a == null) {
    return 1
  }
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b))
  }
  return a - b
}


/* String Utilities
----------------------------------------------------------------------------------------------------------------------*/


export function capitaliseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}


export function padStart(val, len) { // doesn't work with total length more than 3
  let s = String(val)
  return '000'.substr(0, len - s.length) + s
}


/* Number Utilities
----------------------------------------------------------------------------------------------------------------------*/


export function compareNumbers(a, b) { // for .sort()
  return a - b
}


export function isInt(n) {
  return n % 1 === 0
}


/* Weird Utilities
----------------------------------------------------------------------------------------------------------------------*/


export function applyAll(functions, thisObj, args) {
  if (typeof functions === 'function') { // supplied a single function
    functions = [ functions ]
  }
  if (functions) {
    let i
    let ret
    for (i = 0; i < functions.length; i++) {
      ret = functions[i].apply(thisObj, args) || ret
    }
    return ret
  }
}


export function firstDefined(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== undefined) {
      return args[i]
    }
  }
}


/* Object Parsing
----------------------------------------------------------------------------------------------------------------------*/


export type GenericHash = { [key: string]: any }

// Number and Boolean are only types that defaults or not computed for
// TODO: write more comments
export function refineProps(rawProps: GenericHash, processors: GenericHash, defaults: GenericHash = {}, leftoverProps?: GenericHash): GenericHash {
  let refined: GenericHash = {}

  for (let key in processors) {
    let processor = processors[key]

    if (rawProps[key] !== undefined) {
      // found
      if (processor === Function) {
        refined[key] = typeof rawProps[key] === 'function' ? rawProps[key] : null
      } else if (processor) { // a refining function?
        refined[key] = processor(rawProps[key])
      } else {
        refined[key] = rawProps[key]
      }
    } else if (defaults[key] !== undefined) {
      // there's an explicit default
      refined[key] = defaults[key]
    } else {
      // must compute a default
      if (processor === String) {
        refined[key] = '' // empty string is default for String
      } else if (!processor || processor === Number || processor === Boolean || processor === Function) {
        refined[key] = null // assign null for other non-custom processor funcs
      } else {
        refined[key] = processor(null) // run the custom processor func
      }
    }
  }

  if (leftoverProps) {
    for (let key in rawProps) {
      if (processors[key] === undefined) {
        leftoverProps[key] = rawProps[key]
      }
    }
  }

  return refined
}


/* Date stuff that doesn't belong in datelib core
----------------------------------------------------------------------------------------------------------------------*/


// given a timed range, computes an all-day range that has the same exact duration,
// but whose start time is aligned with the start of the day.
export function computeAlignedDayRange(timedRange: DateRange): DateRange {
  let dayCnt = Math.floor(diffDays(timedRange.start, timedRange.end)) || 1
  let start = startOfDay(timedRange.start)
  let end = addDays(start, dayCnt)
  return { start, end }
}


// given a timed range, computes an all-day range based on how for the end date bleeds into the next day
// TODO: give nextDayThreshold a default arg
export function computeVisibleDayRange(timedRange: OpenDateRange, nextDayThreshold: Duration = createDuration(0)): OpenDateRange {
  let startDay: DateMarker = null
  let endDay: DateMarker = null

  if (timedRange.end) {
    endDay = startOfDay(timedRange.end)

    let endTimeMS: number = timedRange.end.valueOf() - endDay.valueOf() // # of milliseconds into `endDay`

    // If the end time is actually inclusively part of the next day and is equal to or
    // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
    // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
    if (endTimeMS && endTimeMS >= asRoughMs(nextDayThreshold)) {
      endDay = addDays(endDay, 1)
    }
  }

  if (timedRange.start) {
    startDay = startOfDay(timedRange.start) // the beginning of the day the range starts

    // If end is within `startDay` but not past nextDayThreshold, assign the default duration of one day.
    if (endDay && endDay <= startDay) {
      endDay = addDays(startDay, 1)
    }
  }

  return { start: startDay, end: endDay }
}


// spans from one day into another?
export function isMultiDayRange(range: DateRange) {
  let visibleRange = computeVisibleDayRange(range)

  return diffDays(visibleRange.start, visibleRange.end) > 1
}


export function diffDates(date0: DateMarker, date1: DateMarker, dateEnv: DateEnv, largeUnit?: string) {
  if (largeUnit === 'year') {
    return createDuration(dateEnv.diffWholeYears(date0, date1), 'year')!
  } else if (largeUnit === 'month') {
    return createDuration(dateEnv.diffWholeMonths(date0, date1), 'month')!
  } else {
    return diffDayAndTime(date0, date1) // returns a duration
  }
}


/* FC-specific DOM dimension stuff
----------------------------------------------------------------------------------------------------------------------*/

export function computeSmallestCellWidth(cellEl: HTMLElement) {
  let allWidthEl = cellEl.querySelector('[data-fc-width-all]')
  let contentWidthEl = cellEl.querySelector('[data-fc-width-content]')

  if (!allWidthEl) {
    throw new Error('needs data-fc-width-all') // TODO: use const
  }
  if (!contentWidthEl) {
    throw new Error('needs data-fc-width-content')
  }

  return cellEl.getBoundingClientRect().width - allWidthEl.getBoundingClientRect().width + // the cell padding+border
    contentWidthEl.getBoundingClientRect().width
}
