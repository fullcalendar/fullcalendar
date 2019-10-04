import { computeEdges } from '../util/dom-geom'
import { createElement, applyStyle, applyStyleProp } from '../util/dom-manip'
import { ElementScrollController } from './scroll-controller'
import { Component } from '../view-framework'

export interface ScrollbarWidths {
  left: number
  right: number
  bottom: number
}

export interface ScrollComponentProps {
  overflowX: string
  overflowY: string
}

/*
Embodies a div that has potential scrollbars
*/
export default class ScrollComponent extends Component<ScrollComponentProps> {

  el = createElement('div', { className: 'fc-scroller' })
  controller = new ElementScrollController(this.el)


  render(props: ScrollComponentProps) {
    this.applyOverflow(props)

    return this.el
  }


  // sets to natural height, unlocks overflow
  clear() {
    this.setHeight('auto')
    this.applyOverflow(this.props)
  }


  // Overflow
  // -----------------------------------------------------------------------------------------------------------------


  applyOverflow(props: ScrollComponentProps) {
    applyStyle(this.el, {
      overflowX: props.overflowX,
      overflowY: props.overflowY
    })
  }


  // Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
  // Useful for preserving scrollbar widths regardless of future resizes.
  // Can pass in scrollbarWidths for optimization.
  lockOverflow(scrollbarWidths: ScrollbarWidths) {
    let { controller } = this
    let { overflowX, overflowY } = this.props

    scrollbarWidths = scrollbarWidths || this.getScrollbarWidths()

    if (overflowX === 'auto') {
      overflowX = (
          scrollbarWidths.bottom || // horizontal scrollbars?
          controller.canScrollHorizontally() // OR scrolling pane with massless scrollbars?
        ) ? 'scroll' : 'hidden'
    }

    if (overflowY === 'auto') {
      overflowY = (
          scrollbarWidths.left || scrollbarWidths.right || // horizontal scrollbars?
          controller.canScrollVertically() // OR scrolling pane with massless scrollbars?
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
