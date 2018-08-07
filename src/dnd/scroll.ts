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

export class WindowScrollController extends ElScrollController {

  constructor() {
    super(document.documentElement)
  }

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

}

export abstract class ScrollControllerCache extends ScrollController {

  rect: Rect
  scrollController: ScrollController

  protected scrollTop: number
  protected scrollLeft: number
  protected scrollWidth: number
  protected scrollHeight: number
  protected clientWidth: number
  protected clientHeight: number

  constructor(scrollController: ScrollController) {
    super()
    this.scrollController = scrollController
    this.scrollTop = scrollController.getScrollTop()
    this.scrollLeft = scrollController.getScrollLeft()
    this.scrollWidth = scrollController.getScrollWidth()
    this.scrollHeight = scrollController.getScrollHeight()
    this.clientWidth = scrollController.getClientWidth()
    this.clientHeight = scrollController.getClientHeight()
    this.rect = this.computeRect() // do last in case it needs cached values
    this.getEventTarget().addEventListener('scroll', this.handleScroll)
  }

  destroy() {
    this.getEventTarget().removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    this.scrollTop = this.scrollController.getScrollTop()
    this.scrollLeft = this.scrollController.getScrollLeft()
    this._handleScroll()
  }

  _handleScroll() { }

  abstract computeRect(): Rect
  abstract getEventTarget(): EventTarget

  getScrollTop() {
    return this.scrollTop
  }

  getScrollLeft() {
    return this.scrollLeft
  }

  setScrollTop(n) {
    this.scrollController.setScrollTop(n)
    this.scrollTop = Math.max(Math.min(n, this.getMaxScrollTop()), 0) // in meantime before handleScroll
    this._handleScroll()
  }

  setScrollLeft(n) {
    this.scrollController.setScrollLeft(n)
    this.scrollLeft = Math.max(Math.min(n, this.getMaxScrollLeft()), 0) // in meantime before handleScroll
    this._handleScroll()
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

}

export class ElScrollControllerCache extends ScrollControllerCache {

  scrollController: ElScrollController

  computeRect() {
    return computeRect(this.scrollController.el)
  }

  getEventTarget(): EventTarget {
    return this.scrollController.el
  }

}

export class WindowScrollControllerCache extends ScrollControllerCache {

  scrollController: WindowScrollController

  computeRect(): Rect {
    return { // computeViewportRect needed anymore?
      left: this.scrollLeft,
      right: this.scrollLeft + this.clientWidth, // clientWidth best?
      top: this.scrollTop,
      bottom: this.scrollTop + this.clientHeight // clientHeight best?
    }
  }

  getEventTarget(): EventTarget {
    return window
  }

  _handleScroll() {
    this.rect = this.computeRect()
  }

}
