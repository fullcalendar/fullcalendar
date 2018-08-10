import { createElement, removeElement } from './dom-manip'
import { Rect, intersectRects } from './geom'

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


export function computeEdges(el, getPadding = false): EdgeInfo {
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


export function computeInnerRect(el, goWithinPadding = false) {
  let outerRect = computeRect(el)
  let edges = computeEdges(el, goWithinPadding)
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


export function computeRect(el): Rect {
  let rect = el.getBoundingClientRect()

  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY
  }
}


function computeViewportRect(): Rect {
  return {
    left: window.scrollX,
    right: window.scrollX + document.documentElement.clientWidth,
    top: window.scrollY,
    bottom: window.scrollY + document.documentElement.clientHeight
  }
}


export function computeHeightAndMargins(el: HTMLElement) {
  let computed = window.getComputedStyle(el)
  return el.offsetHeight +
    parseInt(computed.marginTop, 10) +
    parseInt(computed.marginBottom, 10)
}


export function getClippingParents(el: HTMLElement): HTMLElement[] {
  let parents: HTMLElement[] = []

  while (el instanceof HTMLElement) { // will stop when gets to document or null
    let computedStyle = window.getComputedStyle(el)

    if (computedStyle.position === 'fixed') {
      break
    }

    if ((/(auto|scroll)/).test(computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX)) {
      parents.push(el)
    }

    el = el.parentNode as HTMLElement
  }

  return parents
}


export function computeClippingRect(el: HTMLElement): Rect {
  return getClippingParents(el)
    .map(function(el) {
      return computeInnerRect(el)
    })
    .concat(computeViewportRect())
    .reduce(function(rect0, rect1) {
      return intersectRects(rect0, rect1) || rect1 // should always intersect
    })
}


// The scrollbar width computations in computeEdges are sometimes flawed when it comes to
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
  let outerEl = createElement('div', {
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
