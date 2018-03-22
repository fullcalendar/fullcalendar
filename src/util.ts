import * as moment from 'moment'
import { applyStyle, computeHeightAndMargins, makeElement, removeElement } from './util/dom'


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
    let naturalOffset = computeHeightAndMargins(el)

    if (naturalOffset < minOffset) {
      flexEls.push(el)
      flexOffsets.push(naturalOffset)
      flexHeights.push(el.offsetHeight)
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


// Given `els`, a jQuery set of <td> cells, find the cell with the largest natural width and set the widths of all the
// cells to be that width.
// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
export function matchCellWidths(els: HTMLElement[]) {
  let maxInnerWidth = 0

  els.forEach(function(el) {
    let innerEl = el.firstChild // hopefully an element
    if (innerEl instanceof HTMLElement) {
      let innerWidth = innerEl.offsetWidth
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

  let diff = outerEl.offsetHeight - innerEl.offsetHeight // grab the dimensions

  // undo hack
  let resetStyleProps = { position: '', left: '' }
  applyStyle(outerEl, resetStyleProps)
  applyStyle(innerEl, resetStyleProps)

  return diff
}


/* Element Geom Utilities
----------------------------------------------------------------------------------------------------------------------*/


// will return null of no scroll parent. will NOT return window/body
export function getScrollParent(el: HTMLElement): HTMLElement | null {

  while (el instanceof HTMLElement) { // will stop when gets to document or null
    let computedStyle = window.getComputedStyle(el)

    if (computedStyle.position === 'fixed') {
      break
    }

    if ((/(auto|scroll)/).test(computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX)) {
      return el
    }

    el = el.parentNode as HTMLElement
  }

  return null
}


export interface EdgeInfo {
  borderLeft: number
  borderRight: number
  borderTop: number
  borderBottom: number
  scrollbarLeft: number
  scrollbarRight: number
  scrollbarBottom: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
}

export function getEdges(el, getPadding = false): EdgeInfo {
  let computedStyle = window.getComputedStyle(el)
  let borderLeft = parseInt(computedStyle.borderLeftWidth, 10) || 0
  let borderRight = parseInt(computedStyle.borderRightWidth, 10) || 0
  let borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0
  let borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0
  let scrollbarLeftRight = sanitizeScrollbarWidth(el.offsetWidth - el.clientWidth - borderLeft - borderRight)
  let scrollbarBottom = sanitizeScrollbarWidth(el.offsetHeight - el.clientHeight - borderTop - borderBottom)
  let res: EdgeInfo = {
    borderLeft,
    borderRight,
    borderTop,
    borderBottom,
    scrollbarBottom,
    scrollbarLeft: 0,
    scrollbarRight: 0
  }

  if (getIsLeftRtlScrollbars() && computedStyle.direction === 'rtl') { // is the scrollbar on the left side?
    res.scrollbarLeft = scrollbarLeftRight
  } else {
    res.scrollbarRight = scrollbarLeftRight
  }

  if (getPadding) {
    res.paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0
    res.paddingRight = parseInt(computedStyle.paddingRight, 10) || 0
    res.paddingTop = parseInt(computedStyle.paddingTop, 10) || 0
    res.paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0
  }

  return res
}

export function getInnerRect(el, goWithinPadding = false) {
  let outerRect = el.getBoundingClientRect()
  let edges = getEdges(el, goWithinPadding)
  let res = {
    left: outerRect.left + edges.borderLeft + edges.scrollbarLeft,
    right: outerRect.right - edges.borderRight - edges.scrollbarRight,
    top: outerRect.top + edges.borderTop,
    bottom: outerRect.bottom - edges.borderBottom - edges.scrollbarBottom
  }

  if (goWithinPadding) {
    res.left += edges.paddingLeft
    res.right -= edges.paddingRight
    res.top += edges.paddingTop
    res.bottom -= edges.paddingBottom
  }

  return res
}


// The scrollbar width computations in getEdges are sometimes flawed when it comes to
// retina displays, rounding, and IE11. Massage them into a usable value.
function sanitizeScrollbarWidth(width) {
  width = Math.max(0, width) // no negatives
  width = Math.round(width)
  return width
}


// Logic for determining if, when the element is right-to-left, the scrollbar appears on the left side

let _isLeftRtlScrollbars = null

function getIsLeftRtlScrollbars() { // responsible for caching the computation
  if (_isLeftRtlScrollbars === null) {
    _isLeftRtlScrollbars = computeIsLeftRtlScrollbars()
  }
  return _isLeftRtlScrollbars
}

function computeIsLeftRtlScrollbars() { // creates an offscreen test element, then removes it
  let outerEl = makeElement('div', {
    style: {
      position: 'absolute',
      top: -1000,
      left: 0,
      border: 0,
      padding: 0,
      overflow: 'scroll',
      direction: 'rtl'
    }
  }, '<div></div>')

  document.body.appendChild(outerEl)
  let innerEl = outerEl.firstChild as HTMLElement
  let res = innerEl.getBoundingClientRect().left > outerEl.getBoundingClientRect().left

  removeElement(outerEl)
  return res
}


/* Mouse / Touch Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
export function isPrimaryMouseButton(ev: MouseEvent) {
  return ev.button === 0 && !ev.ctrlKey
}


export function getEvX(ev: UIEvent) {
  let touches = (ev as TouchEvent).touches

  // on mobile FF, pageX for touch events is present, but incorrect,
  // so, look at touch coordinates first.
  if (touches && touches.length) {
    return touches[0].pageX
  }

  return (ev as MouseEvent).pageX
}


export function getEvY(ev) {
  let touches = (ev as TouchEvent).touches

  // on mobile FF, pageX for touch events is present, but incorrect,
  // so, look at touch coordinates first.
  if (touches && touches.length) {
    return touches[0].pageY
  }

  return (ev as MouseEvent).pageY
}


export function getEvIsTouch(ev) {
  return /^touch/.test(ev.type)
}


export function preventSelection(el: HTMLElement) {
  el.classList.add('fc-unselectable')
  el.addEventListener('selectstart', preventDefault)
}


export function allowSelection(el: HTMLElement) {
  el.classList.remove('fc-unselectable')
  el.removeEventListener('selectstart', preventDefault)
}


// Stops a mouse/touch event from doing it's native browser action
export function preventDefault(ev) {
  ev.preventDefault()
}


/* General Geometry Utils
----------------------------------------------------------------------------------------------------------------------*/


// Returns a new rectangle that is the intersection of the two rectangles. If they don't intersect, returns false
export function intersectRects(rect1, rect2) {
  let res = {
    left: Math.max(rect1.left, rect2.left),
    right: Math.min(rect1.right, rect2.right),
    top: Math.max(rect1.top, rect2.top),
    bottom: Math.min(rect1.bottom, rect2.bottom)
  }

  if (res.left < res.right && res.top < res.bottom) {
    return res
  }
  return false
}


// Returns a new point that will have been moved to reside within the given rectangle
export function constrainPoint(point, rect) {
  return {
    left: Math.min(Math.max(point.left, rect.left), rect.right),
    top: Math.min(Math.max(point.top, rect.top), rect.bottom)
  }
}


// Returns a point that is the center of the given rectangle
export function getRectCenter(rect) {
  return {
    left: (rect.left + rect.right) / 2,
    top: (rect.top + rect.bottom) / 2
  }
}


// Subtracts point2's coordinates from point1's coordinates, returning a delta
export function diffPoints(point1, point2) {
  return {
    left: point1.left - point2.left,
    top: point1.top - point2.top
  }
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


export function compareByFieldSpecs(obj1, obj2, fieldSpecs, obj1fallback?, obj2fallback?) {
  let i
  let cmp

  for (i = 0; i < fieldSpecs.length; i++) {
    cmp = compareByFieldSpec(obj1, obj2, fieldSpecs[i], obj1fallback, obj2fallback)
    if (cmp) {
      return cmp
    }
  }

  return 0
}


export function compareByFieldSpec(obj1, obj2, fieldSpec, obj1fallback, obj2fallback) {
  if (fieldSpec.func) {
    return fieldSpec.func(obj1, obj2)
  }

  let val1 = obj1[fieldSpec.field]
  let val2 = obj2[fieldSpec.field]

  if (val1 == null && obj1fallback) {
    val1 = obj1fallback[fieldSpec.field]
  }

  if (val2 == null && obj2fallback) {
    val2 = obj2fallback[fieldSpec.field]
  }

  return flexibleCompare(val1, val2) * (fieldSpec.order || 1)
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


/* Date Utilities
----------------------------------------------------------------------------------------------------------------------*/

export const dayIDs = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
export const unitsDesc = [ 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond' ] // descending


// Diffs the two moments into a Duration where full-days are recorded first, then the remaining time.
// Moments will have their timezones normalized.
export function diffDayTime(a, b) {
  return moment.duration({
    days: a.clone().stripTime().diff(b.clone().stripTime(), 'days'),
    ms: a.time() - b.time() // time-of-day from day start. disregards timezone
  })
}


// Diffs the two moments via their start-of-day (regardless of timezone). Produces whole-day durations.
export function diffDay(a, b) {
  return moment.duration({
    days: a.clone().stripTime().diff(b.clone().stripTime(), 'days')
  })
}


// Diffs two moments, producing a duration, made of a whole-unit-increment of the given unit. Uses rounding.
export function diffByUnit(a, b, unit) {
  return moment.duration(
    Math.round(a.diff(b, unit, true)), // returnFloat=true
    unit
  )
}


// Computes the unit name of the largest whole-unit period of time.
// For example, 48 hours will be "days" whereas 49 hours will be "hours".
// Accepts start/end, a range object, or an original duration object.
export function computeGreatestUnit(start, end?) {
  let i
  let unit
  let val

  for (i = 0; i < unitsDesc.length; i++) {
    unit = unitsDesc[i]
    val = computeRangeAs(unit, start, end)

    if (val >= 1 && isInt(val)) {
      break
    }
  }

  return unit // will be "milliseconds" if nothing else matches
}


// like computeGreatestUnit, but has special abilities to interpret the source input for clues
export function computeDurationGreatestUnit(duration, durationInput) {
  let unit = computeGreatestUnit(duration)

  // prevent days:7 from being interpreted as a week
  if (unit === 'week' && typeof durationInput === 'object' && durationInput && durationInput.days) { // non-null object
    unit = 'day'
  }

  return unit
}


// Computes the number of units (like "hours") in the given range.
// Range can be a {start,end} object, separate start/end args, or a Duration.
// Results are based on Moment's .as() and .diff() methods, so results can depend on internal handling
// of month-diffing logic (which tends to vary from version to version).
function computeRangeAs(unit, start, end) {

  if (end != null) { // given start, end
    return end.diff(start, unit, true)
  } else if (moment.isDuration(start)) { // given duration
    return start.as(unit)
  } else { // given { start, end } range object
    return start.end.diff(start.start, unit, true)
  }
}


// Intelligently divides a range (specified by a start/end params) by a duration
export function divideRangeByDuration(start, end, dur) {
  let months

  if (durationHasTime(dur)) {
    return (end - start) / dur
  }
  months = dur.asMonths()
  if (Math.abs(months) >= 1 && isInt(months)) {
    return end.diff(start, 'months', true) / months
  }
  return end.diff(start, 'days', true) / dur.asDays()
}


// Intelligently divides one duration by another
export function divideDurationByDuration(dur1, dur2) {
  let months1
  let months2

  if (durationHasTime(dur1) || durationHasTime(dur2)) {
    return dur1 / dur2
  }
  months1 = dur1.asMonths()
  months2 = dur2.asMonths()
  if (
    Math.abs(months1) >= 1 && isInt(months1) &&
    Math.abs(months2) >= 1 && isInt(months2)
  ) {
    return months1 / months2
  }
  return dur1.asDays() / dur2.asDays()
}


// Intelligently multiplies a duration by a number
export function multiplyDuration(dur, n) {
  let months

  if (durationHasTime(dur)) {
    return moment.duration(dur * n)
  }
  months = dur.asMonths()
  if (Math.abs(months) >= 1 && isInt(months)) {
    return moment.duration({ months: months * n })
  }
  return moment.duration({ days: dur.asDays() * n })
}


// Returns a boolean about whether the given duration has any time parts (hours/minutes/seconds/ms)
export function durationHasTime(dur) {
  return Boolean(dur.hours() || dur.minutes() || dur.seconds() || dur.milliseconds())
}


export function isNativeDate(input) {
  return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date
}


// Returns a boolean about whether the given input is a time string, like "06:40:00" or "06:00"
export function isTimeString(str) {
  return typeof str === 'string' &&
    /^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(str)
}


/* Logging and Debug
----------------------------------------------------------------------------------------------------------------------*/


export function log(...args) {
  let console = window.console

  if (console && console.log) {
    return console.log.apply(console, args)
  }
}

export function warn(...args) {
  let console = window.console

  if (console && console.warn) {
    return console.warn.apply(console, args)
  } else {
    return log.apply(null, args)
  }
}


/* General Utilities
----------------------------------------------------------------------------------------------------------------------*/

const hasOwnPropMethod = {}.hasOwnProperty


// Merges an array of objects into a single object.
// The second argument allows for an array of property names who's object values will be merged together.
export function mergeProps(propObjs, complexProps?) {
  let dest = {}
  let i
  let name
  let complexObjs
  let j
  let val
  let props

  if (complexProps) {
    for (i = 0; i < complexProps.length; i++) {
      name = complexProps[i]
      complexObjs = []

      // collect the trailing object values, stopping when a non-object is discovered
      for (j = propObjs.length - 1; j >= 0; j--) {
        val = propObjs[j][name]

        if (typeof val === 'object' && val) { // non-null object
          complexObjs.unshift(val)
        } else if (val !== undefined) {
          dest[name] = val // if there were no objects, this value will be used
          break
        }
      }

      // if the trailing values were objects, use the merged value
      if (complexObjs.length) {
        dest[name] = mergeProps(complexObjs)
      }
    }
  }

  // copy values into the destination, going from last to first
  for (i = propObjs.length - 1; i >= 0; i--) {
    props = propObjs[i]

    for (name in props) {
      if (!(name in dest)) { // if already assigned by previous props or complex props, don't reassign
        dest[name] = props[name]
      }
    }
  }

  return dest
}


export function copyOwnProps(src, dest) {
  for (let name in src) {
    if (hasOwnProp(src, name)) {
      dest[name] = src[name]
    }
  }
}


export function hasOwnProp(obj, name) {
  return hasOwnPropMethod.call(obj, name)
}


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


export function removeMatching(array, testFunc) {
  let removeCnt = 0
  let i = 0

  while (i < array.length) {
    if (testFunc(array[i])) { // truthy value means *remove*
      array.splice(i, 1)
      removeCnt++
    } else {
      i++
    }
  }

  return removeCnt
}


export function removeExact(array, exactVal) {
  let removeCnt = 0
  let i = 0

  while (i < array.length) {
    if (array[i] === exactVal) {
      array.splice(i, 1)
      removeCnt++
    } else {
      i++
    }
  }

  return removeCnt
}


export function isArraysEqual(a0, a1) {
  let len = a0.length
  let i

  if (len == null || len !== a1.length) { // not array? or not same length?
    return false
  }

  for (i = 0; i < len; i++) {
    if (a0[i] !== a1[i]) {
      return false
    }
  }

  return true
}



export function firstDefined(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== undefined) {
      return args[i]
    }
  }
}


export function htmlEscape(s) {
  return (s + '').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#039;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br />')
}


export function stripHtmlEntities(text) {
  return text.replace(/&.*?;/g, '')
}


// Given a hash of CSS properties, returns a string of CSS.
// Uses property names as-is (no camel-case conversion). Will not make statements for null/undefined values.
export function cssToStr(cssProps) {
  let statements = []

  for (let name in cssProps) {
    let val = cssProps[name]
    if (val != null) {
      statements.push(name + ':' + val)
    }
  }

  return statements.join(';')
}


// Given an object hash of HTML attribute names to values,
// generates a string that can be injected between < > in HTML
export function attrsToStr(attrs) {
  let parts = []

  for (let name in attrs) {
    let val = attrs[name]
    if (val != null) {
      parts.push(name + '="' + htmlEscape(val) + '"')
    }
  }

  return parts.join(' ')
}


export function capitaliseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}


export function compareNumbers(a, b) { // for .sort()
  return a - b
}


export function isInt(n) {
  return n % 1 === 0
}


// Returns a method bound to the given object context.
// Just like one of the jQuery.proxy signatures, but without the undesired behavior of treating the same method with
// different contexts as identical when binding/unbinding events.
export function proxy(obj, methodName) {
  let method = obj[methodName]

  return function() {
    return method.apply(obj, arguments)
  }
}


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
export function debounce(func, wait, immediate= false) {
  let timeout
  let args
  let context
  let timestamp
  let result

  let later = function() {
    let last = +new Date() - timestamp
    if (last < wait) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        context = args = null
      }
    }
  }

  return function() {
    context = this
    args = arguments
    timestamp = +new Date()
    let callNow = immediate && !timeout
    if (!timeout) {
      timeout = setTimeout(later, wait)
    }
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }
    return result
  }
}
