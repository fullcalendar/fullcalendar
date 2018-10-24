import { computeEdges } from '../util/dom-geom'
import { removeElement, createElement, applyStyle, applyStyleProp } from '../util/dom-manip'
import { ElementScrollController } from './scroll-controller'

export interface ScrollbarWidths {
  left: number
  right: number
  bottom: number
}

/*
Embodies a div that has potential scrollbars
*/
export default class ScrollComponent extends ElementScrollController {

  overflowX: string
  overflowY: string

  constructor(overflowX: string, overflowY: string) {
    super(
      createElement('div', {
        className: 'fc-scroller'
      })
    )
    this.overflowX = overflowX
    this.overflowY = overflowY
    this.applyOverflow()
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
    applyStyle(this.el, {
      overflowX: this.overflowX,
      overflowY: this.overflowY
    })
  }


  // Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
  // Useful for preserving scrollbar widths regardless of future resizes.
  // Can pass in scrollbarWidths for optimization.
  lockOverflow(scrollbarWidths: ScrollbarWidths) {
    let overflowX = this.overflowX
    let overflowY = this.overflowY

    scrollbarWidths = scrollbarWidths || this.getScrollbarWidths()

    if (overflowX === 'auto') {
      overflowX = (
          scrollbarWidths.bottom || // horizontal scrollbars?
          this.canScrollHorizontally() // OR scrolling pane with massless scrollbars?
        ) ? 'scroll' : 'hidden'
    }

    if (overflowY === 'auto') {
      overflowY = (
          scrollbarWidths.left || scrollbarWidths.right || // horizontal scrollbars?
          this.canScrollVertically() // OR scrolling pane with massless scrollbars?
        ) ? 'scroll' : 'hidden'
    }

    applyStyle(this.el, { overflowX, overflowY })
  }


  setHeight(height: number | string) {
    applyStyleProp(this.el, 'height', height)
  }


  getScrollbarWidths(): ScrollbarWidths {
    let edges = computeEdges(this.el)
    return {
      left: edges.scrollbarLeft,
      right: edges.scrollbarRight,
      bottom: edges.scrollbarBottom
    }
  }

}
