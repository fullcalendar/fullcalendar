import { applyStyle, computeHeightAndMargins } from './util/dom'
import { preventDefault } from './util/dom-event'


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


// Given `els`, a set of <td> cells, find the cell with the largest natural width and set the widths of all the
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
