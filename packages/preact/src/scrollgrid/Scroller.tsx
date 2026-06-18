import { DateComponent } from '../component/DateComponent'
import { computeElIsRtl } from '../util/dom-manip'
import { setRef } from '../vdom-util'
import { watchHeight, watchWidth } from '../component-util/resize-observer'
import { Dictionary } from '../options'
import type { ReactNode, Ref } from 'react'
import { joinClassNames } from '../util/html'
import { ScrollerInterface } from './ScrollerInterface'
import { ScrollListener } from './ScrollListener'
import classNames from '../styles.module.css'

export interface ScrollerProps {
  vertical?: boolean // true always implies 'auto' (won't show scrollbars if no overflow)
  horizontal?: boolean // (same)
  hideScrollbars?: boolean // default: false
  children?: ReactNode

  // dimension refs
  clientWidthRef?: Ref<number>
  clientHeightRef?: Ref<number>
  bottomScrollbarWidthRef?: Ref<number>
  /*
  NOTE: a `endScrollbarWidthRef` is not offered
  Instead, use a <Ruler> to get to the total width, subtract the clientWidth
  Originally, `endScrollbarWidthRef` was implemented as you might expect,
  but yielded Safari ResizeObserver loop warnings.
  Something about it being outside the scroller, near the bottom of the calendar view
  guarantees is doesn't interfere with other size watching. IDK.
  Ultimate solution is to do what ag-grid does: know the scrollbar width ahead of time,
  know the available height, total content height, in order to predict scollbars without querying dom.
  */

  // el hooks
  className?: string
  style?: Dictionary
}

export class Scroller extends DateComponent<ScrollerProps> implements ScrollerInterface {
  // ref
  private el?: HTMLDivElement

  // internal
  private _isUnmounting: boolean
  public listener: ScrollListener // public for ScrollerSyncer
  private disconnectHRuler?: () => void
  private disconnectVRuler?: () => void

  // current values
  private clientWidth?: number
  private clientHeight?: number
  private bottomScrollbarWidth?: number

  render() {
    const { props } = this

    // if there's only one axis that needs scrolling, the other axis will unintentionally have
    // scrollbars too if we don't force to 'hidden'
    const fallbackOverflow = (props.horizontal || props.vertical) ? 'hidden' : ''

    return (
      <div
        ref={this.handleEl}
        className={joinClassNames(
          props.className,
          classNames.noPadding,
          classNames.rel, // for children fillTop/fillStart
          props.hideScrollbars && classNames.noScrollbars,
          classNames.internalScroller,
        )}
        style={{
          ...props.style,
          overflowX: (props.horizontal ? 'auto' : fallbackOverflow) as any,
          overflowY: (props.vertical ? 'auto' : fallbackOverflow) as any,
        }}
      >
        {props.children}
        {Boolean(props.clientWidthRef) && (
          <div ref={this.handleHRuler} className={classNames.fillTop} />
        )}
        {Boolean(props.clientHeightRef || props.bottomScrollbarWidthRef) && (
          <div ref={this.handleVRuler} className={classNames.fillStart} />
        )}
      </div>
    )
  }

  handleEl = (el: HTMLDivElement | null) => {
    if (this.el) {
      this.el = null
      this._isUnmounting = true
      this.listener.destroy()
    }

    if (el) {
      this.el = el
      this._isUnmounting = false
      this.listener = new ScrollListener(el)
    }
  }

  handleHRuler = (el: HTMLDivElement | null) => {
    if (this.disconnectHRuler) {
      this.disconnectHRuler()
      this.disconnectHRuler = undefined

      if (this.clientWidth !== undefined) {
        this.clientWidth = undefined
        setRef(this.props.clientWidthRef, null)
      }
    }

    if (el) {
      this.disconnectHRuler = watchWidth(el, (clientWidth) => {
        if (this._isUnmounting) return
        if (clientWidth !== this.clientWidth) {
          this.clientWidth = clientWidth
          setRef(this.props.clientWidthRef, clientWidth)
        }
      })
    }
  }

  handleVRuler = (el: HTMLDivElement | null) => {
    if (this.disconnectVRuler) {
      this.disconnectVRuler()
      this.disconnectVRuler = undefined

      if (this.clientHeight !== undefined) {
        this.clientHeight = undefined
        setRef(this.props.clientHeightRef, null)
      }
    }

    if (el) {
      this.disconnectVRuler = watchHeight(el, (clientHeight) => {
        if (this._isUnmounting) return
        if (clientHeight !== this.clientHeight) {
          this.clientHeight = clientHeight
          setRef(this.props.clientHeightRef, clientHeight)
        }

        const bottomScrollbarWidth = Math.round(this.el.getBoundingClientRect().height - clientHeight)
        if (bottomScrollbarWidth !== this.bottomScrollbarWidth) {
          this.bottomScrollbarWidth = bottomScrollbarWidth
          setRef(this.props.bottomScrollbarWidthRef, bottomScrollbarWidth)
        }
      })
    }
  }

  endScroll() {
    this.listener.endScroll()
  }

  // Public API
  // -----------------------------------------------------------------------------------------------

  get x(): number {
    const { el } = this
    return el ? getNormalizedScrollX(el) : 0
  }

  get y(): number {
    const { el } = this
    return el ? el.scrollTop : 0
  }

  scrollTo({ x, y }: { x?: number, y?: number }): void {
    const { el } = this

    if (el) {
      if (y != null) {
        el.scrollTop = y
      }

      if (x != null) {
        setNormalizedScrollX(el, x)
      }
    }
  }

  addScrollStartListener(handler: () => void): void {
    this.listener.emitter.on('scrollStart', handler)
  }

  removeScrollStartListener(handler: () => void): void {
    this.listener.emitter.off('scrollStart', handler)
  }

  addScrollEndListener(handler: (isDevice: boolean) => void): void {
    this.listener.emitter.on('scrollEnd', handler)
  }

  removeScrollEndListener(handler: (isDevice: boolean) => void): void {
    this.listener.emitter.off('scrollEnd', handler)
  }
}

// Public API
// -------------------------------------------------------------------------------------------------
// We can drop normalization when support for Chromium-based <86 is dropped (see Notion)

export function getNormalizedScrollX(el: HTMLElement): number {
  const { scrollLeft } = el
  const isRtl = computeElIsRtl(el)
  return isRtl ? getNormalizedRtlScrollX(scrollLeft, el) : scrollLeft
}

export function setNormalizedScrollX(el: HTMLElement, x: number): void {
  const isRtl = computeElIsRtl(el)
  el.scrollLeft = isRtl ? getNormalizedRtlScrollLeft(x, el) : x
}

/*
Returns a value in the 'reverse' system
*/
function getNormalizedRtlScrollX(scrollLeft: number, el: HTMLElement): number {
  switch (getRtlScrollerSystem()) {
    case 'positive':
      return el.scrollWidth - el.clientWidth - scrollLeft
    case 'negative':
      return -scrollLeft
  }
  return scrollLeft
}

/*
Receives a value in the 'reverse' system
TODO: is this really the same equations as getNormalizedRtlScrollX??? I think so
  If so, consolidate. With isRtl check too
*/
function getNormalizedRtlScrollLeft(x: number, el: HTMLElement): number {
  switch (getRtlScrollerSystem()) {
    case 'positive':
      return el.scrollWidth - el.clientWidth - x
    case 'negative':
      return -x
  }
  return x
}

// Detection
// -------------------------------------------------------------------------------------------------

type RtlScrollerSystem = 'positive' | 'negative' | 'reverse'

let _rtlScrollerSystem: RtlScrollerSystem | undefined

function getRtlScrollerSystem(): RtlScrollerSystem {
  return _rtlScrollerSystem || (_rtlScrollerSystem = detectRtlScrollerSystem())
}

function detectRtlScrollerSystem(): RtlScrollerSystem {
  let el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.top = '-1000px'
  el.style.width = '100px' // must be at least the side of scrollbars or you get inaccurate values (#7335)
  el.style.height = '100px' // "
  el.style.overflow = 'scroll'
  el.style.direction = 'rtl'

  let innerEl = document.createElement('div')
  innerEl.style.width = '200px'
  innerEl.style.height = '200px'

  el.appendChild(innerEl)
  document.body.appendChild(el)

  let system: RtlScrollerSystem
  if (el.scrollLeft > 0) {
    system = 'positive' // scroll is a positive number from the left edge
  } else {
    el.scrollLeft = 50
    if (el.scrollLeft > 0) {
      system = 'reverse' // scroll is a positive number from the right edge
    } else {
      system = 'negative' // scroll is a negative number from the right edge
    }
  }

  el.remove()

  return system
}
