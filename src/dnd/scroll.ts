import { Rect } from '../util/geom'
import { computeRect } from '../util/dom-geom'

// TODO: join with RTL scroller normalization utils

export abstract class ScrollController {

  abstract getScrollTop(): number
  abstract getScrollLeft(): number
  abstract setScrollTop(number): void
  abstract setScrollLeft(number): void
  abstract getClientWidth(): number
  abstract getClientHeight(): number
  abstract getScrollWidth(): number
  abstract getScrollHeight(): number

  getMaxScrollTop() {
    return this.getScrollHeight() - this.getClientHeight()
  }

  getMaxScrollLeft() {
    return this.getScrollWidth() - this.getClientWidth()
  }

  canScrollUp() {
    return this.getScrollTop() > 0
  }

  canScrollDown() {
    return this.getScrollTop() < this.getMaxScrollTop()
  }

  canScrollLeft() {
    return this.getScrollLeft() > 0
  }

  canScrollRight() {
    return this.getScrollLeft() < this.getMaxScrollLeft()
  }

}

export class ElScrollController extends ScrollController {

  el: HTMLElement

  constructor(el: HTMLElement) {
    super()
    this.el = el
  }

  getScrollTop() {
    return this.el.scrollTop
  }

  getScrollLeft() {
    return this.el.scrollLeft
  }

  setScrollTop(n: number) {
    this.el.scrollTop = n
  }

  setScrollLeft(n: number) {
    this.el.scrollLeft = n
  }

  getScrollWidth() {
    return this.el.scrollWidth
  }

  getScrollHeight() {
    return this.el.scrollHeight
  }

  getClientHeight() {
    return this.el.clientHeight
  }

  getClientWidth() {
    return this.el.clientWidth
  }

}

export class WindowScrollController extends ScrollController {

  getScrollTop() {
    return window.scrollY
  }

  getScrollLeft() {
    return window.scrollX
  }

  setScrollTop(n: number) {
    window.scroll(window.scrollX, n)
  }

  setScrollLeft(n: number) {
    window.scroll(n, window.scrollY)
  }

  getScrollWidth() {
    return document.documentElement.scrollWidth
  }

  getScrollHeight() {
    return document.documentElement.scrollHeight
  }

  getClientHeight() {
    return document.documentElement.clientHeight
  }

  getClientWidth() {
    return document.documentElement.clientWidth
  }

}

// TODO: more of a "dimensions" cache
export abstract class ScrollControllerCache extends ScrollController {

  rect: Rect
  scrollController: ScrollController

  doesListening: boolean

  origScrollTop: number
  origScrollLeft: number

  scrollTop: number
  scrollLeft: number
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
    this.rect = this.computeRect() // do last in case it needs cached values

    if (this.doesListening) {
      this.getEventTarget().addEventListener('scroll', this.handleScroll)
    }
  }

  abstract getEventTarget(): EventTarget
  abstract computeRect(): Rect

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

export class ElScrollControllerCache extends ScrollControllerCache {

  scrollController: ElScrollController

  getEventTarget(): EventTarget {
    return this.scrollController.el
  }

  computeRect() {
    return computeRect(this.scrollController.el)
  }

}

export class WindowScrollControllerCache extends ScrollControllerCache {

  scrollController: WindowScrollController

  getEventTarget(): EventTarget {
    return window
  }

  computeRect(): Rect {
    return {
      left: this.scrollLeft,
      right: this.scrollLeft + this.clientWidth,
      top: this.scrollTop,
      bottom: this.scrollTop + this.clientHeight
    }
  }

  handleScrollChange() {
    this.rect = this.computeRect()
  }

}
