import * as exportHooks from '../exports'
import { elementClosest } from '../util/dom-manip'
import { default as EmitterMixin } from '../common/EmitterMixin'
import { isPrimaryMouseButton } from '../util/dom-event'

(exportHooks as any).touchMouseIgnoreWait = 500

export interface PointerDragEvent {
  origEvent: UIEvent
  isTouch: boolean
  el: HTMLElement
  pageX: number
  pageY: number
}

export type PointerEventHandler = (ev: PointerDragEvent) => void

export default class PointerDragListener {

  containerEl: HTMLElement
  selector: string
  ignoreMove: any
  subjectEl: HTMLElement
  emitter: EmitterMixin

  isDragging: boolean = false
  isDraggingTouch: boolean = false
  isTouchScroll: boolean = false

  constructor(containerEl: HTMLElement, selector: string, ignoreMove: any) {
    this.containerEl = containerEl
    this.selector = selector
    this.ignoreMove = ignoreMove
    this.emitter = new EmitterMixin()
    containerEl.addEventListener('mousedown', this.onMouseDown)
    containerEl.addEventListener('touchstart', this.onTouchStart)
    listenerCreated()
  }

  destroy() {
    this.containerEl.removeEventListener('mousedown', this.onMouseDown)
    this.containerEl.removeEventListener('touchstart', this.onTouchStart)
    listenerDestroyed()
  }

  on(name, handler: PointerEventHandler) {
    this.emitter.on(name, handler)
  }

  simulateStart(pev: PointerDragEvent) {
    if (pev.isTouch) {
      this.onTouchStart(pev.origEvent as TouchEvent)
    } else {
      this.onMouseDown(pev.origEvent as MouseEvent)
    }
  }

  maybeStart(ev) {
    if ((this.subjectEl = this.queryValidSubjectEl(ev))) {
      this.isDragging = true // do this first so cancelTouchScroll will work
      return true
    }
  }

  cleanupDrag() { // do this last, so that pointerup has access to props
    isWindowTouchMoveCancelled = false
    this.isDragging = false
    this.isTouchScroll = false
    this.subjectEl = null
  }

  onTouchScroll = () => {
    this.isTouchScroll = true
  }

  queryValidSubjectEl(ev: UIEvent): HTMLElement {
    if (this.selector) {
      return elementClosest(ev.target as HTMLElement, this.selector)
    } else {
      return this.containerEl
    }
  }

  onMouseDown = (ev: MouseEvent) => {
    if (
      !this.shouldIgnoreMouse() &&
      isPrimaryMouseButton(ev) &&
      this.maybeStart(ev)
    ) {
      this.emitter.trigger('pointerdown', this.createMouseEvent(ev))

      if (!this.ignoreMove) {
        document.addEventListener('mousemove', this.onMouseMove)
      }

      document.addEventListener('mouseup', this.onMouseUp)
    }
  }

  onMouseMove = (ev: MouseEvent) => {
    this.emitter.trigger('pointermove', this.createMouseEvent(ev))
  }

  onMouseUp = (ev: MouseEvent) => {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
    this.emitter.trigger('pointerup', this.createMouseEvent(ev))
    this.cleanupDrag()
  }

  onTouchStart = (ev: TouchEvent) => {
    if (this.maybeStart(ev)) {
      this.isDraggingTouch = true
      this.emitter.trigger('pointerdown', this.createTouchEvent(ev))

      // unlike mouse, need to attach to target, not document
      // https://stackoverflow.com/a/45760014
      let target = ev.target

      if (!this.ignoreMove) {
        target.addEventListener('touchmove', this.onTouchMove)
      }

      target.addEventListener('touchend', this.onTouchEnd)
      target.addEventListener('touchcancel', this.onTouchEnd) // treat it as a touch end

      // attach a handler to get called when ANY scroll action happens on the page.
      // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
      // http://stackoverflow.com/a/32954565/96342
      window.addEventListener(
        'scroll',
        this.onTouchScroll, // always bound to `this`
        true // useCapture
      )
    }
  }

  onTouchMove = (ev: TouchEvent) => {
    this.emitter.trigger('pointermove', this.createTouchEvent(ev))
  }

  onTouchEnd = (ev: TouchEvent) => {
    if (this.isDragging) { // guard against touchend followed by touchcancel
      let target = ev.target
      target.removeEventListener('touchmove', this.onTouchMove)
      target.removeEventListener('touchend', this.onTouchEnd)
      target.removeEventListener('touchcancel', this.onTouchEnd)

      window.removeEventListener('scroll', this.onTouchScroll)

      this.emitter.trigger('pointerup', this.createTouchEvent(ev))
      this.cleanupDrag()
      this.isDraggingTouch = false
      this.startIgnoringMouse()
    }
  }

  shouldIgnoreMouse() {
    return ignoreMouseDepth || this.isDraggingTouch
  }

  startIgnoringMouse() {
    ignoreMouseDepth++

    setTimeout(() => {
      ignoreMouseDepth--
    }, (exportHooks as any).touchMouseIgnoreWait)
  }

  cancelTouchScroll() {
    if (this.isDragging) {
      isWindowTouchMoveCancelled = true
    }
  }

  createMouseEvent(ev): PointerDragEvent {
    return {
      origEvent: ev,
      isTouch: false,
      el: this.subjectEl,
      pageX: ev.pageX,
      pageY: ev.pageY
    }
  }

  createTouchEvent(ev): PointerDragEvent {
    let obj = {
      origEvent: ev,
      isTouch: true,
      el: this.subjectEl
    } as PointerDragEvent
    let touches = ev.touches

    // if touch coords available, prefer,
    // because FF would give bad ev.pageX ev.pageY
    if (touches && touches.length) {
      obj.pageX = touches[0].pageX
      obj.pageY = touches[0].pageY
    } else {
      obj.pageX = ev.pageX
      obj.pageY = ev.pageY
    }

    return obj
  }

}

let ignoreMouseDepth = 0

// we want to attach touchmove as early as possible for safari

let listenerCnt = 0
let isWindowTouchMoveCancelled = false

function listenerCreated() {
  if (!(listenerCnt++)) {
    window.addEventListener('touchmove', onWindowTouchMove, { passive: false })
  }
}

function listenerDestroyed() {
  if (!(--listenerCnt)) {
    window.removeEventListener('touchmove', onWindowTouchMove)
  }
}

function onWindowTouchMove(ev) {
  if (isWindowTouchMoveCancelled) {
    ev.preventDefault()
  }
}
