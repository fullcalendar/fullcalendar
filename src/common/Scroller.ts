import { getEdges } from '../util'
import { removeElement } from '../util/dom'
import Class from '../common/Class'

/*
Embodies a div that has potential scrollbars
*/
export default class Scroller extends Class {

  el: HTMLElement // the guaranteed outer element
  scrollEl: HTMLElement // the element with the scrollbars
  overflowX: any
  overflowY: any


  constructor(options?) {
    super()
    options = options || {}
    this.overflowX = options.overflowX || options.overflow || 'auto'
    this.overflowY = options.overflowY || options.overflow || 'auto'
  }


  render() {
    this.el = this.renderEl()
    this.applyOverflow()
  }


  renderEl() {
    let scrollEl = document.createElement('div')
    scrollEl.classList.add('fc-scroller')
    this.scrollEl = scrollEl
    return scrollEl
  }


  // sets to natural height, unlocks overflow
  clear() {
    this.setHeight('auto')
    this.applyOverflow()
  }


  destroy() {
    removeElement(this.el)
  }


  // Overflow
  // -----------------------------------------------------------------------------------------------------------------


  applyOverflow() {
    this.scrollEl.style.overflowX = this.overflowX
    this.scrollEl.style.overflowY = this.overflowY
  }


  // Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
  // Useful for preserving scrollbar widths regardless of future resizes.
  // Can pass in scrollbarWidths for optimization.
  lockOverflow(scrollbarWidths) {
    let { scrollEl } = this
    let overflowX = this.overflowX
    let overflowY = this.overflowY

    scrollbarWidths = scrollbarWidths || this.getScrollbarWidths()

    if (overflowX === 'auto') {
      overflowX = (
          scrollbarWidths.bottom || // horizontal scrollbars?
          // OR scrolling pane with massless scrollbars?
          scrollEl.scrollWidth - 1 > scrollEl.clientWidth
            // subtract 1 because of IE off-by-one issue
        ) ? 'scroll' : 'hidden'
    }

    if (overflowY === 'auto') {
      overflowY = (
          scrollbarWidths.left || scrollbarWidths.right || // vertical scrollbars?
          // OR scrolling pane with massless scrollbars?
          scrollEl.scrollHeight - 1 > scrollEl.clientHeight
            // subtract 1 because of IE off-by-one issue
        ) ? 'scroll' : 'hidden'
    }

    scrollEl.style.overflowX = overflowX
    scrollEl.style.overflowY = overflowY
  }


  // Getters / Setters
  // -----------------------------------------------------------------------------------------------------------------


  setHeight(height) {
    this.scrollEl.style.height =
      typeof height === 'number' ?
        height + 'px' :
        height
  }


  getScrollTop() {
    return this.scrollEl.scrollTop
  }


  setScrollTop(top) {
    this.scrollEl.scrollTop = top
  }


  getClientWidth() {
    return this.scrollEl.clientWidth
  }


  getClientHeight() {
    return this.scrollEl.clientHeight
  }


  getScrollbarWidths() {
    let edges = getEdges(this.scrollEl)
    return {
      left: edges.scrollbarLeft,
      right: edges.scrollbarRight,
      bottom: edges.scrollbarBottom
    }
  }

}
