import { computeEdges } from '../util/dom-geom'
import { ElementScrollController } from './scroll-controller'
import { Component, h, ComponentChildren } from '../vdom'
import { __assign } from 'tslib'

export interface ScrollbarWidths {
  left: number
  right: number
  bottom: number
}

export interface ScrollerProps {
  overflowX: string
  overflowY: string
  children?: ComponentChildren
  extraClassName?: string
}

/*
Embodies a div that has potential scrollbars
*/
export default class Scroller extends Component<ScrollerProps> { // TODO: why not BaseComponent???

  private forcedStyles = {} as any

  rootEl: HTMLDivElement
  controller: ElementScrollController


  render(props: ScrollerProps) {
    let { forcedStyles } = this

    return (
      <div ref={this.setRootEl} class={'fc-scroller ' + (props.extraClassName || '')} style={{
        height: forcedStyles.height,
        overflowX: forcedStyles.overflowX || props.overflowX,
        overflowY: forcedStyles.overflowY || props.overflowY
      }}>
        {props.children}
      </div>
    )
  }


  setRootEl = (rootEl: HTMLDivElement | null) => {
    if (rootEl) {
      this.rootEl = rootEl
      this.controller = rootEl ? new ElementScrollController(rootEl) : null
    }
  }


  private forceStyles(forcedStyles: any) {
    __assign(this.forcedStyles, forcedStyles)
    __assign(this.rootEl.style, forcedStyles)
  }


  clear() {
    this.forceStyles({
      height: 'auto',
      overflowXOverride: '',
      overflowYOverride: ''
    })
  }


  // Overflow
  // -----------------------------------------------------------------------------------------------------------------


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

    this.forceStyles({ overflowX, overflowY })
  }


  setHeight(height: number | string) {
    this.forceStyles({
      height: typeof height === 'number' ? height + 'px' : height // TODO: util for this
    })
  }


  getScrollbarWidths(): ScrollbarWidths {
    let edges = computeEdges(this.rootEl)

    return {
      left: edges.scrollbarLeft,
      right: edges.scrollbarRight,
      bottom: edges.scrollbarBottom
    }
  }

}
