import { createElement, removeElement } from './dom-manip'


// Logic for determining if, when the element is right-to-left, the scrollbar appears on the left side

let isRtlScrollbarOnLeft: boolean | null = null

export function getIsRtlScrollbarOnLeft() { // responsible for caching the computation
  if (isRtlScrollbarOnLeft === null) {
    isRtlScrollbarOnLeft = computeIsRtlScrollbarOnLeft()
  }
  return isRtlScrollbarOnLeft
}

function computeIsRtlScrollbarOnLeft() { // creates an offscreen test element, then removes it
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


// The scrollbar width computations in computeEdges are sometimes flawed when it comes to
// retina displays, rounding, and IE11. Massage them into a usable value.
export function sanitizeScrollbarWidth(width: number) {
  width = Math.max(0, width) // no negatives
  width = Math.round(width)
  return width
}
