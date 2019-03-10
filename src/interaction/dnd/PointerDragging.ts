import { config, elementClosest, EmitterMixin, PointerDragEvent } from '@fullcalendar/core'

config.touchMouseIgnoreWait = 500

let ignoreMouseDepth = 0
let listenerCnt = 0
let isWindowTouchMoveCancelled = false

/*
Uses a "pointer" abstraction, which monitors UI events for both mouse and touch.
Tracks when the pointer "drags" on a certain element, meaning down+move+up.

Also, tracks if there was touch-scrolling.
Also, can prevent touch-scrolling from happening.
Also, can fire pointermove events when scrolling happens underneath, even when no real pointer movement.

emits:
- pointerdown
- pointermove
- pointerup
*/
export default class PointerDragging {

  containerEl: EventTarget
  subjectEl: HTMLElement | null = null
  downEl: HTMLElement | null = null
  emitter: EmitterMixin

  // options that can be directly assigned by caller
  selector: string = '' // will cause subjectEl in all emitted events to be this element
  handleSelector: string = ''
  shouldIgnoreMove: boolean = false
  shouldWatchScroll: boolean = true // for simulating pointermove on scroll

  // internal states
  isDragging: boolean = false
  isTouchDragging: boolean = false
  wasTouchScroll: boolean = false
  origPageX: number
  origPageY: number
  prevPageX: number
  prevPageY: number
  prevScrollX: number // at time of last pointer pageX/pageY capture
  prevScrollY: number // "

  constructor(containerEl: EventTarget) {
    this.containerEl = containerEl
    this.emitter = new EmitterMixin()
    containerEl.addEventListener('mousedown', this.handleMouseDown as EventListener)
    containerEl.addEventListener('touchstart', this.handleTouchStart as EventListener, { passive: true })
    listenerCreated()
  }

  destroy() {
    this.containerEl.removeEventListener('mousedown', this.handleMouseDown as EventListener)
    this.containerEl.removeEventListener('touchstart', this.handleTouchStart as EventListener, { passive: true } as AddEventListenerOptions)
    listenerDestroyed()
  }

  tryStart(ev: UIEvent): boolean {
    let subjectEl = this.querySubjectEl(ev)
    let downEl = ev.target as HTMLElement

    if (
      subjectEl &&
      (!this.handleSelector || elementClosest(downEl, this.handleSelector))
    ) {
      this.subjectEl = subjectEl
      this.downEl = downEl
      this.isDragging = true // do this first so cancelTouchScroll will work
      this.wasTouchScroll = false

      return true
    }

    return false
  }

  cleanup() {
    isWindowTouchMoveCancelled = false
    this.isDragging = false
    this.subjectEl = null
    this.downEl = null
    // keep wasTouchScroll around for later access
    this.destroyScrollWatch()
  }

  querySubjectEl(ev: UIEvent): HTMLElement {
    if (this.selector) {
      return elementClosest(ev.target as HTMLElement, this.selector)
    } else {
      return this.containerEl as HTMLElement
    }
  }


  // Mouse
  // ----------------------------------------------------------------------------------------------------

  handleMouseDown = (ev: MouseEvent) => {
    if (
      !this.shouldIgnoreMouse() &&
      isPrimaryMouseButton(ev) &&
      this.tryStart(ev)
    ) {
      let pev = this.createEventFromMouse(ev, true)
      this.emitter.trigger('pointerdown', pev)
      this.initScrollWatch(pev)

      if (!this.shouldIgnoreMove) {
        document.addEventListener('mousemove', this.handleMouseMove)
      }

      document.addEventListener('mouseup', this.handleMouseUp)
    }
  }

  handleMouseMove = (ev: MouseEvent) => {
    let pev = this.createEventFromMouse(ev)
    this.recordCoords(pev)
    this.emitter.trigger('pointermove', pev)
  }

  handleMouseUp = (ev: MouseEvent) => {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)

    this.emitter.trigger('pointerup', this.createEventFromMouse(ev))

    this.cleanup() // call last so that pointerup has access to props
  }

  shouldIgnoreMouse() {
    return ignoreMouseDepth || this.isTouchDragging
  }


  // Touch
  // ----------------------------------------------------------------------------------------------------

  handleTouchStart = (ev: TouchEvent) => {
    if (this.tryStart(ev)) {
      this.isTouchDragging = true

      let pev = this.createEventFromTouch(ev, true)
      this.emitter.trigger('pointerdown', pev)
      this.initScrollWatch(pev)

      // unlike mouse, need to attach to target, not document
      // https://stackoverflow.com/a/45760014
      let target = ev.target as HTMLElement

      if (!this.shouldIgnoreMove) {
        target.addEventListener('touchmove', this.handleTouchMove)
      }

      target.addEventListener('touchend', this.handleTouchEnd)
      target.addEventListener('touchcancel', this.handleTouchEnd) // treat it as a touch end

      // attach a handler to get called when ANY scroll action happens on the page.
      // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
      // http://stackoverflow.com/a/32954565/96342
      window.addEventListener(
        'scroll',
        this.handleTouchScroll,
        true // useCapture
      )
    }

  }

  handleTouchMove = (ev: TouchEvent) => {
    let pev = this.createEventFromTouch(ev)
    this.recordCoords(pev)
    this.emitter.trigger('pointermove', pev)
  }

  handleTouchEnd = (ev: TouchEvent) => {
    if (this.isDragging) { // done to guard against touchend followed by touchcancel
      let target = ev.target as HTMLElement

      target.removeEventListener('touchmove', this.handleTouchMove)
      target.removeEventListener('touchend', this.handleTouchEnd)
      target.removeEventListener('touchcancel', this.handleTouchEnd)
      window.removeEventListener('scroll', this.handleTouchScroll, true) // useCaptured=true

      this.emitter.trigger('pointerup', this.createEventFromTouch(ev))

      this.cleanup() // call last so that pointerup has access to props
      this.isTouchDragging = false
      startIgnoringMouse()
    }
  }

  handleTouchScroll = () => {
    this.wasTouchScroll = true
  }

  // can be called by user of this class, to cancel touch-based scrolling for the current drag
  cancelTouchScroll() {
    if (this.isDragging) {
      isWindowTouchMoveCancelled = true
    }
  }


  // Scrolling that simulates pointermoves
  // ----------------------------------------------------------------------------------------------------

  initScrollWatch(ev: PointerDragEvent) {
    if (this.shouldWatchScroll) {
      this.recordCoords(ev)
      window.addEventListener('scroll', this.handleScroll, true) // useCapture=true
    }
  }

  recordCoords(ev: PointerDragEvent) {
    if (this.shouldWatchScroll) {
      this.prevPageX = (ev as any).pageX
      this.prevPageY = (ev as any).pageY
      this.prevScrollX = window.pageXOffset
      this.prevScrollY = window.pageYOffset
    }
  }

  handleScroll = (ev: UIEvent) => {
    if (!this.shouldIgnoreMove) {
      let pageX = (window.pageXOffset - this.prevScrollX) + this.prevPageX
      let pageY = (window.pageYOffset - this.prevScrollY) + this.prevPageY

      this.emitter.trigger('pointermove', {
        origEvent: ev,
        isTouch: this.isTouchDragging,
        subjectEl: this.subjectEl,
        pageX,
        pageY,
        deltaX: pageX - this.origPageX,
        deltaY: pageY - this.origPageY
      } as PointerDragEvent)
    }
  }

  destroyScrollWatch() {
    if (this.shouldWatchScroll) {
      window.removeEventListener('scroll', this.handleScroll, true) // useCaptured=true
    }
  }


  // Event Normalization
  // ----------------------------------------------------------------------------------------------------

  createEventFromMouse(ev: MouseEvent, isFirst?: boolean): PointerDragEvent {
    let deltaX = 0
    let deltaY = 0

    // TODO: repeat code
    if (isFirst) {
      this.origPageX = ev.pageX
      this.origPageY = ev.pageY
    } else {
      deltaX = ev.pageX - this.origPageX
      deltaY = ev.pageY - this.origPageY
    }

    return {
      origEvent: ev,
      isTouch: false,
      subjectEl: this.subjectEl,
      pageX: ev.pageX,
      pageY: ev.pageY,
      deltaX,
      deltaY
    }
  }

  createEventFromTouch(ev: TouchEvent, isFirst?: boolean): PointerDragEvent {
    let touches = ev.touches
    let pageX
    let pageY
    let deltaX = 0
    let deltaY = 0

    // if touch coords available, prefer,
    // because FF would give bad ev.pageX ev.pageY
    if (touches && touches.length) {
      pageX = touches[0].pageX
      pageY = touches[0].pageY
    } else {
      pageX = (ev as any).pageX
      pageY = (ev as any).pageY
    }

    // TODO: repeat code
    if (isFirst) {
      this.origPageX = pageX
      this.origPageY = pageY
    } else {
      deltaX = pageX - this.origPageX
      deltaY = pageY - this.origPageY
    }

    return {
      origEvent: ev,
      isTouch: true,
      subjectEl: this.subjectEl,
      pageX,
      pageY,
      deltaX,
      deltaY
    }
  }

}

// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
function isPrimaryMouseButton(ev: MouseEvent) {
  return ev.button === 0 && !ev.ctrlKey
}


// Ignoring fake mouse events generated by touch
// ----------------------------------------------------------------------------------------------------

function startIgnoringMouse() { // can be made non-class function
  ignoreMouseDepth++

  setTimeout(() => {
    ignoreMouseDepth--
  }, config.touchMouseIgnoreWait)
}


// We want to attach touchmove as early as possible for Safari
// ----------------------------------------------------------------------------------------------------

function listenerCreated() {
  if (!(listenerCnt++)) {
    window.addEventListener('touchmove', onWindowTouchMove, { passive: false })
  }
}

function listenerDestroyed() {
  if (!(--listenerCnt)) {
    window.removeEventListener('touchmove', onWindowTouchMove, { passive: false } as AddEventListenerOptions)
  }
}

function onWindowTouchMove(ev: UIEvent) {
  if (isWindowTouchMoveCancelled) {
    ev.preventDefault()
  }
}
