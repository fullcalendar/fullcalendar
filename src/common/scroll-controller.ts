
/*
An object for getting/setting scroll-related information for an element.
Internally, this is done very differently for window versus DOM element,
so this object serves as a common interface.
*/
export abstract class ScrollController {

  abstract getScrollTop(): number
  abstract getScrollLeft(): number
  abstract setScrollTop(top: number): void
  abstract setScrollLeft(left: number): void
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

  canScrollVertically() {
    return this.getMaxScrollTop() > 0
  }

  canScrollHorizontally() {
    return this.getMaxScrollLeft() > 0
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

export class ElementScrollController extends ScrollController {

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

  setScrollTop(top: number) {
    this.el.scrollTop = top
  }

  setScrollLeft(left: number) {
    this.el.scrollLeft = left
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
    return window.pageYOffset
  }

  getScrollLeft() {
    return window.pageXOffset
  }

  setScrollTop(n: number) {
    window.scroll(window.pageXOffset, n)
  }

  setScrollLeft(n: number) {
    window.scroll(n, window.pageYOffset)
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
