import { applyStyle } from './dom-manip'
import { computeVMargins } from './dom-geom'
import { preventDefault } from './dom-event'
import { DateMarker, startOfDay, addDays, diffDays, diffDayAndTime } from '../datelib/marker'
import { Duration, asRoughMs, createDuration } from '../datelib/duration'
import { DateEnv } from '../datelib/env'
import { DateRange, OpenDateRange } from '../datelib/date-range'


/* FullCalendar-specific DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
// and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
export function compensateScroll(rowEl: HTMLElement, scrollbarWidths) {
  if (scrollbarWidths.left) {
    applyStyle(rowEl, {
      borderLeftWidth: 1,
      marginLeft: scrollbarWidths.left - 1
    })
  }
  if (scrollbarWidths.right) {
    applyStyle(rowEl, {
      borderRightWidth: 1,
      marginRight: scrollbarWidths.right - 1
    })
  }
}


// Undoes compensateScroll and restores all borders/margins
export function uncompensateScroll(rowEl: HTMLElement) {
  applyStyle(rowEl, {
    marginLeft: '',
    marginRight: '',
    borderLeftWidth: '',
    borderRightWidth: ''
  })
}


// Make the mouse cursor express that an event is not allowed in the current area
export function disableCursor() {
  document.body.classList.add('fc-not-allowed')
}


// Returns the mouse cursor to its original look
export function enableCursor() {
  document.body.classList.remove('fc-not-allowed')
}


// Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
// By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
// any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and
// reduces the available height.
export function distributeHeight(els: HTMLElement[], availableHeight, shouldRedistribute) {

  // *FLOORING NOTE*: we floor in certain places because zoom can give inaccurate floating-point dimensions,
  // and it is better to be shorter than taller, to avoid creating unnecessary scrollbars.

  let minOffset1 = Math.floor(availableHeight / els.length) // for non-last element
  let minOffset2 = Math.floor(availableHeight - minOffset1 * (els.length - 1)) // for last element *FLOORING NOTE*
  let flexEls = [] // elements that are allowed to expand. array of DOM nodes
  let flexOffsets = [] // amount of vertical space it takes up
  let flexHeights = [] // actual css height
  let usedHeight = 0

  undistributeHeight(els) // give all elements their natural height

  // find elements that are below the recommended height (expandable).
  // important to query for heights in a single first pass (to avoid reflow oscillation).
  els.forEach(function(el, i) {
    let minOffset = i === els.length - 1 ? minOffset2 : minOffset1
    let naturalHeight = el.getBoundingClientRect().height
    let naturalOffset = naturalHeight + computeVMargins(el)

    if (naturalOffset < minOffset) {
      flexEls.push(el)
      flexOffsets.push(naturalOffset)
      flexHeights.push(naturalHeight)
    } else {
      // this element stretches past recommended height (non-expandable). mark the space as occupied.
      usedHeight += naturalOffset
    }
  })

  // readjust the recommended height to only consider the height available to non-maxed-out rows.
  if (shouldRedistribute) {
    availableHeight -= usedHeight
    minOffset1 = Math.floor(availableHeight / flexEls.length)
    minOffset2 = Math.floor(availableHeight - minOffset1 * (flexEls.length - 1)) // *FLOORING NOTE*
  }

  // assign heights to all expandable elements
  flexEls.forEach(function(el, i) {
    let minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1
    let naturalOffset = flexOffsets[i]
    let naturalHeight = flexHeights[i]
    let newHeight = minOffset - (naturalOffset - naturalHeight) // subtract the margin/padding

    if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
      el.style.height = newHeight + 'px'
    }
  })
}


// Undoes distrubuteHeight, restoring all els to their natural height
export function undistributeHeight(els: HTMLElement[]) {
  els.forEach(function(el) {
    el.style.height = ''
  })
}


// Given `els`, a set of <td> cells, find the cell with the largest natural width and set the widths of all the
// cells to be that width.
// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
export function matchCellWidths(els: HTMLElement[]) {
  let maxInnerWidth = 0

  els.forEach(function(el) {
    let innerEl = el.firstChild // hopefully an element
    if (innerEl instanceof HTMLElement) {
      let innerWidth = innerEl.getBoundingClientRect().width
      if (innerWidth > maxInnerWidth) {
        maxInnerWidth = innerWidth
      }
    }
  })

  maxInnerWidth++ // sometimes not accurate of width the text needs to stay on one line. insurance

  els.forEach(function(el) {
    el.style.width = maxInnerWidth + 'px'
  })

  return maxInnerWidth
}


// Given one element that resides inside another,
// Subtracts the height of the inner element from the outer element.
export function subtractInnerElHeight(outerEl: HTMLElement, innerEl: HTMLElement) {

  // effin' IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
  let reflowStyleProps = {
    position: 'relative', // cause a reflow, which will force fresh dimension recalculation
    left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
  }
  applyStyle(outerEl, reflowStyleProps)
  applyStyle(innerEl, reflowStyleProps)

  let diff = // grab the dimensions
    outerEl.getBoundingClientRect().height -
    innerEl.getBoundingClientRect().height

  // undo hack
  let resetStyleProps = { position: '', left: '' }
  applyStyle(outerEl, resetStyleProps)
  applyStyle(innerEl, resetStyleProps)

  return diff
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

export function parseFieldSpecs(input) {
  let specs = []
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


export function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
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


export function compareByFieldSpec(obj0, obj1, fieldSpec) {
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


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
export function debounce(func, wait) {
  let timeout
  let args
  let context
  let timestamp
  let result

  let later = function() {
    let last = new Date().valueOf() - timestamp
    if (last < wait) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      result = func.apply(context, args)
      context = args = null
    }
  }

  return function() {
    context = this
    args = arguments
    timestamp = new Date().valueOf()
    if (!timeout) {
      timeout = setTimeout(later, wait)
    }
    return result
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
