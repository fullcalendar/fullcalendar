import { removeElement, applyStyle } from './dom-manip.js'

let _isRtlScrollbarOnLeft: boolean | null = null

export function getIsRtlScrollbarOnLeft() { // responsible for caching the computation
  if (_isRtlScrollbarOnLeft === null) {
    _isRtlScrollbarOnLeft = computeIsRtlScrollbarOnLeft()
  }
  return _isRtlScrollbarOnLeft
}

function computeIsRtlScrollbarOnLeft() { // creates an offscreen test element, then removes it
  let outerEl = document.createElement('div')
  applyStyle(outerEl, {
    position: 'absolute',
    top: -1000,
    left: 0,
    border: 0,
    padding: 0,
    overflow: 'scroll',
    direction: 'rtl',
  })
  outerEl.innerHTML = '<div></div>'

  document.body.appendChild(outerEl)
  let innerEl = outerEl.firstChild as HTMLElement
  let res = innerEl.getBoundingClientRect().left > outerEl.getBoundingClientRect().left

  removeElement(outerEl)
  return res
}
