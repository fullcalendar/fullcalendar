import {
  Rect, computeInnerRect,
  ScrollController, ElementScrollController, WindowScrollController
} from '@fullcalendar/core'

/*
Is a cache for a given element's scroll information (all the info that ScrollController stores)
in addition the "client rectangle" of the element.. the area within the scrollbars.

The cache can be in one of two modes:
- doesListening:false - ignores when the container is scrolled by someone else
- doesListening:true - watch for scrolling and update the cache
*/
export abstract class ScrollGeomCache extends ScrollController {

  clientRect: Rect
  origScrollTop: number
  origScrollLeft: number

  protected scrollController: ScrollController
  protected doesListening: boolean
  protected scrollTop: number
  protected scrollLeft: number
  protected scrollWidth: number
  protected scrollHeight: number
  protected clientWidth: number
  protected clientHeight: number

  constructor(scrollController: ScrollController, doesListening: boolean) {
    super()
    this.scrollController = scrollController
    this.doesListening = doesListening
    this.scrollTop = this.origScrollTop = scrollController.getScrollTop()
    this.scrollLeft = this.origScrollLeft = scrollController.getScrollLeft()
    this.scrollWidth = scrollController.getScrollWidth()
    this.scrollHeight = scrollController.getScrollHeight()
    this.clientWidth = scrollController.getClientWidth()
    this.clientHeight = scrollController.getClientHeight()
    this.clientRect = this.computeClientRect() // do last in case it needs cached values

    if (this.doesListening) {
      this.getEventTarget().addEventListener('scroll', this.handleScroll)
    }
  }

  abstract getEventTarget(): EventTarget
  abstract computeClientRect(): Rect

  destroy() {
    if (this.doesListening) {
      this.getEventTarget().removeEventListener('scroll', this.handleScroll)
    }
  }

  handleScroll = () => {
    this.scrollTop = this.scrollController.getScrollTop()
    this.scrollLeft = this.scrollController.getScrollLeft()
    this.handleScrollChange()
  }

  getScrollTop() {
    return this.scrollTop
  }

  getScrollLeft() {
    return this.scrollLeft
  }

  setScrollTop(top: number) {
    this.scrollController.setScrollTop(top)

    if (!this.doesListening) {
      // we are not relying on the element to normalize out-of-bounds scroll values
      // so we need to sanitize ourselves
      this.scrollTop = Math.max(Math.min(top, this.getMaxScrollTop()), 0)

      this.handleScrollChange()
    }
  }

  setScrollLeft(top: number) {
    this.scrollController.setScrollLeft(top)

    if (!this.doesListening) {
      // we are not relying on the element to normalize out-of-bounds scroll values
      // so we need to sanitize ourselves
      this.scrollLeft = Math.max(Math.min(top, this.getMaxScrollLeft()), 0)

      this.handleScrollChange()
    }
  }

  getClientWidth() {
    return this.clientWidth
  }

  getClientHeight() {
    return this.clientHeight
  }

  getScrollWidth() {
    return this.scrollWidth
  }

  getScrollHeight() {
    return this.scrollHeight
  }

  handleScrollChange() {
  }

}

export class ElementScrollGeomCache extends ScrollGeomCache {

  constructor(el: HTMLElement, doesListening: boolean) {
    super(new ElementScrollController(el), doesListening)
  }

  getEventTarget(): EventTarget {
    return (this.scrollController as ElementScrollController).el
  }

  computeClientRect() {
    return computeInnerRect((this.scrollController as ElementScrollController).el)
  }

}

export class WindowScrollGeomCache extends ScrollGeomCache {

  constructor(doesListening: boolean) {
    super(new WindowScrollController(), doesListening)
  }

  getEventTarget(): EventTarget {
    return window
  }

  computeClientRect(): Rect {
    return {
      left: this.scrollLeft,
      right: this.scrollLeft + this.clientWidth,
      top: this.scrollTop,
      bottom: this.scrollTop + this.clientHeight
    }
  }

  // the window is the only scroll object that changes it's rectangle relative
  // to the document's topleft as it scrolls
  handleScrollChange() {
    this.clientRect = this.computeClientRect()
  }

}
