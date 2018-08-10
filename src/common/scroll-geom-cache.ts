import { Rect } from '../util/geom'
import { computeInnerRect } from '../util/dom-geom'
import { ScrollController, ElementScrollController, WindowScrollController } from './scroll-controller'

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

  constructor(scrollController: ScrollController, doesListening) {
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

  setScrollTop(n) {
    this.scrollController.setScrollTop(n)

    if (!this.doesListening) {
      this.scrollTop = Math.max(Math.min(n, this.getMaxScrollTop()), 0)
      this.handleScrollChange()
    }
  }

  setScrollLeft(n) {
    this.scrollController.setScrollLeft(n)

    if (!this.doesListening) {
      this.scrollLeft = Math.max(Math.min(n, this.getMaxScrollLeft()), 0)
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

  scrollController: ElementScrollController

  constructor(el: HTMLElement, doesListening) {
    super(new ElementScrollController(el), doesListening)
  }

  getEventTarget(): EventTarget {
    return this.scrollController.el
  }

  computeClientRect() {
    return computeInnerRect(this.scrollController.el)
  }

}

export class WindowScrollGeomCache extends ScrollGeomCache {

  scrollController: WindowScrollController

  constructor(doesListening) {
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

  handleScrollChange() {
    this.clientRect = this.computeClientRect()
  }

}
