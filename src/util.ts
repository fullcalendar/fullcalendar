import * as moment from 'moment'
import * as $ from 'jquery'


/* FullCalendar-specific DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
// and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
export function compensateScroll(rowEls, scrollbarWidths) {
  if (scrollbarWidths.left) {
    rowEls.css({
      'border-left-width': 1,
      'margin-left': scrollbarWidths.left - 1
    })
  }
  if (scrollbarWidths.right) {
    rowEls.css({
      'border-right-width': 1,
      'margin-right': scrollbarWidths.right - 1
    })
  }
}


// Undoes compensateScroll and restores all borders/margins
export function uncompensateScroll(rowEls) {
  rowEls.css({
    'margin-left': '',
    'margin-right': '',
    'border-left-width': '',
    'border-right-width': ''
  })
}


// Make the mouse cursor express that an event is not allowed in the current area
export function disableCursor() {
  $('body').addClass('fc-not-allowed')
}


// Returns the mouse cursor to its original look
export function enableCursor() {
  $('body').removeClass('fc-not-allowed')
}


// Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
// By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
// any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and
// reduces the available height.
export function distributeHeight(els, availableHeight, shouldRedistribute) {

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
  els.each(function(i, el) {
    let minOffset = i === els.length - 1 ? minOffset2 : minOffset1
    let naturalOffset = $(el).outerHeight(true)

    if (naturalOffset < minOffset) {
      flexEls.push(el)
      flexOffsets.push(naturalOffset)
      flexHeights.push($(el).height())
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
  $(flexEls).each(function(i, el) {
    let minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1
    let naturalOffset = flexOffsets[i]
    let naturalHeight = flexHeights[i]
    let newHeight = minOffset - (naturalOffset - naturalHeight) // subtract the margin/padding

    if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
      $(el).height(newHeight)
    }
  })
}


// Undoes distrubuteHeight, restoring all els to their natural height
export function undistributeHeight(els) {
  els.height('')
}


// Given `els`, a jQuery set of <td> cells, find the cell with the largest natural width and set the widths of all the
// cells to be that width.
// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
export function matchCellWidths(els) {
  let maxInnerWidth = 0

  els.find('> *').each(function(i, innerEl) {
    let innerWidth = $(innerEl).outerWidth()
    if (innerWidth > maxInnerWidth) {
      maxInnerWidth = innerWidth
    }
  })

  maxInnerWidth++ // sometimes not accurate of width the text needs to stay on one line. insurance

  els.width(maxInnerWidth)

  return maxInnerWidth
}


// Given one element that resides inside another,
// Subtracts the height of the inner element from the outer element.
export function subtractInnerElHeight(outerEl, innerEl) {
  let both = outerEl.add(innerEl)
  let diff

  // effin' IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
  both.css({
    position: 'relative', // cause a reflow, which will force fresh dimension recalculation
    left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
  })
  diff = outerEl.outerHeight() - innerEl.outerHeight() // grab the dimensions
  both.css({ position: '', left: '' }) // undo hack

  return diff
}


/* Element Geom Utilities
----------------------------------------------------------------------------------------------------------------------*/


// borrowed from https://github.com/jquery/jquery-ui/blob/1.11.0/ui/core.js#L51
export function getScrollParent(el) {
  let position = el.css('position')
  let scrollParent = el.parents().filter(function() {
    let parent = $(this)
    return (/(auto|scroll)/).test(
      parent.css('overflow') + parent.css('overflow-y') + parent.css('overflow-x')
    )
  }).eq(0)

  return position === 'fixed' || !scrollParent.length ? $(el[0].ownerDocument || document) : scrollParent
}


// Queries the outer bounding area of a jQuery element.
// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
// Origin is optional.
export function getOuterRect(el, origin?) {
  let offset = el.offset()
  let left = offset.left - (origin ? origin.left : 0)
  let top = offset.top - (origin ? origin.top : 0)

  return {
    left: left,
    right: left + el.outerWidth(),
    top: top,
    bottom: top + el.outerHeight()
  }
}


// Queries the area within the margin/border/scrollbars of a jQuery element. Does not go within the padding.
// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
// Origin is optional.
// WARNING: given element can't have borders
// NOTE: should use clientLeft/clientTop, but very unreliable cross-browser.
export function getClientRect(el, origin?) {
  let offset = el.offset()
  let scrollbarWidths = getScrollbarWidths(el)
  let left = offset.left + getCssFloat(el, 'border-left-width') + scrollbarWidths.left - (origin ? origin.left : 0)
  let top = offset.top + getCssFloat(el, 'border-top-width') + scrollbarWidths.top - (origin ? origin.top : 0)

  return {
    left: left,
    right: left + el[0].clientWidth, // clientWidth includes padding but NOT scrollbars
    top: top,
    bottom: top + el[0].clientHeight // clientHeight includes padding but NOT scrollbars
  }
}


// Queries the area within the margin/border/padding of a jQuery element. Assumed not to have scrollbars.
// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
// Origin is optional.
export function getContentRect(el, origin) {
  let offset = el.offset() // just outside of border, margin not included
  let left = offset.left + getCssFloat(el, 'border-left-width') + getCssFloat(el, 'padding-left') -
    (origin ? origin.left : 0)
  let top = offset.top + getCssFloat(el, 'border-top-width') + getCssFloat(el, 'padding-top') -
    (origin ? origin.top : 0)

  return {
    left: left,
    right: left + el.width(),
    top: top,
    bottom: top + el.height()
  }
}


// Returns the computed left/right/top/bottom scrollbar widths for the given jQuery element.
// WARNING: given element can't have borders (which will cause offsetWidth/offsetHeight to be larger).
// NOTE: should use clientLeft/clientTop, but very unreliable cross-browser.
export function getScrollbarWidths(el) {
  let leftRightWidth = el[0].offsetWidth - el[0].clientWidth
  let bottomWidth = el[0].offsetHeight - el[0].clientHeight
  let widths

  leftRightWidth = sanitizeScrollbarWidth(leftRightWidth)
  bottomWidth = sanitizeScrollbarWidth(bottomWidth)

  widths = { left: 0, right: 0, top: 0, bottom: bottomWidth }

  if (getIsLeftRtlScrollbars() && el.css('direction') === 'rtl') { // is the scrollbar on the left side?
    widths.left = leftRightWidth
  } else {
    widths.right = leftRightWidth
  }

  return widths
}


// The scrollbar width computations in getScrollbarWidths are sometimes flawed when it comes to
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
  let el = $('<div><div/></div>')
    .css({
      position: 'absolute',
      top: -1000,
      left: 0,
      border: 0,
      padding: 0,
      overflow: 'scroll',
      direction: 'rtl'
    })
    .appendTo('body')
  let innerEl = el.children()
  let res = innerEl.offset().left > el.offset().left // is the inner div shifted to accommodate a left scrollbar?
  el.remove()
  return res
}


// Retrieves a jQuery element's computed CSS value as a floating-point number.
// If the queried value is non-numeric (ex: IE can return "medium" for border width), will just return zero.
function getCssFloat(el, prop) {
  return parseFloat(el.css(prop)) || 0
}


/* Mouse / Touch Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
export function isPrimaryMouseButton(ev) {
  return ev.which === 1 && !ev.ctrlKey
}


export function getEvX(ev) {
  let touches = ev.originalEvent.touches

  // on mobile FF, pageX for touch events is present, but incorrect,
  // so, look at touch coordinates first.
  if (touches && touches.length) {
    return touches[0].pageX
  }

  return ev.pageX
}


export function getEvY(ev) {
  let touches = ev.originalEvent.touches

  // on mobile FF, pageX for touch events is present, but incorrect,
  // so, look at touch coordinates first.
  if (touches && touches.length) {
    return touches[0].pageY
  }

  return ev.pageY
}


export function getEvIsTouch(ev) {
  return /^touch/.test(ev.type)
}


export function preventSelection(el) {
  el.addClass('fc-unselectable')
    .on('selectstart', preventDefault)
}


export function allowSelection(el) {
  el.removeClass('fc-unselectable')
    .off('selectstart', preventDefault)
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
  } else if ($.isArray(input)) {
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
  if ($.type(a) === 'string' || $.type(b) === 'string') {
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
  if (unit === 'week' && typeof durationInput === 'object' && durationInput.days) {
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

        if (typeof val === 'object') {
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
  if ($.isFunction(functions)) {
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

  $.each(cssProps, function(name, val) {
    if (val != null) {
      statements.push(name + ':' + val)
    }
  })

  return statements.join(';')
}


// Given an object hash of HTML attribute names to values,
// generates a string that can be injected between < > in HTML
export function attrsToStr(attrs) {
  let parts = []

  $.each(attrs, function(name, val) {
    if (val != null) {
      parts.push(name + '="' + htmlEscape(val) + '"')
    }
  })

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
