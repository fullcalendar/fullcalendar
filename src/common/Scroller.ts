import * as $ from 'jquery'
import { getScrollbarWidths } from '../util'
import Class from '../common/Class'

/*
Embodies a div that has potential scrollbars
*/
export default class Scroller extends Class {

  el: any // the guaranteed outer element
  scrollEl: any // the element with the scrollbars
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
    return (this.scrollEl = $('<div class="fc-scroller"></div>'))
  }


  // sets to natural height, unlocks overflow
  clear() {
    this.setHeight('auto')
    this.applyOverflow()
  }


  destroy() {
    this.el.remove()
  }


  // Overflow
  // -----------------------------------------------------------------------------------------------------------------


  applyOverflow() {
    this.scrollEl.css({
      'overflow-x': this.overflowX,
      'overflow-y': this.overflowY
    })
  }


  // Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
  // Useful for preserving scrollbar widths regardless of future resizes.
  // Can pass in scrollbarWidths for optimization.
  lockOverflow(scrollbarWidths) {
    let overflowX = this.overflowX
    let overflowY = this.overflowY

    scrollbarWidths = scrollbarWidths || this.getScrollbarWidths()

    if (overflowX === 'auto') {
      overflowX = (
          scrollbarWidths.top || scrollbarWidths.bottom || // horizontal scrollbars?
          // OR scrolling pane with massless scrollbars?
          this.scrollEl[0].scrollWidth - 1 > this.scrollEl[0].clientWidth
            // subtract 1 because of IE off-by-one issue
        ) ? 'scroll' : 'hidden'
    }

    if (overflowY === 'auto') {
      overflowY = (
          scrollbarWidths.left || scrollbarWidths.right || // vertical scrollbars?
          // OR scrolling pane with massless scrollbars?
          this.scrollEl[0].scrollHeight - 1 > this.scrollEl[0].clientHeight
            // subtract 1 because of IE off-by-one issue
        ) ? 'scroll' : 'hidden'
    }

    this.scrollEl.css({ 'overflow-x': overflowX, 'overflow-y': overflowY })
  }


  // Getters / Setters
  // -----------------------------------------------------------------------------------------------------------------


  setHeight(height) {
    this.scrollEl.height(height)
  }


  getScrollTop() {
    return this.scrollEl.scrollTop()
  }


  setScrollTop(top) {
    this.scrollEl.scrollTop(top)
  }


  getClientWidth() {
    return this.scrollEl[0].clientWidth
  }


  getClientHeight() {
    return this.scrollEl[0].clientHeight
  }


  getScrollbarWidths() {
    return getScrollbarWidths(this.scrollEl)
  }

}
