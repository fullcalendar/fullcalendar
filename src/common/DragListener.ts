import * as $ from 'jquery'
import {
  firstDefined,
  preventSelection,
  getEvIsTouch,
  getEvX,
  getEvY,
  getScrollParent,
  isPrimaryMouseButton,
  allowSelection,
  preventDefault,
  debounce,
  getOuterRect,
  proxy
} from '../util'
import { default as ListenerMixin, ListenerInterface } from './ListenerMixin'
import GlobalEmitter from './GlobalEmitter'


/* Tracks a drag's mouse movement, firing various handlers
----------------------------------------------------------------------------------------------------------------------*/
// TODO: use Emitter

export default class DragListener {

  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']

  options: any
  subjectEl: any

  // coordinates of the initial mousedown
  originX: any
  originY: any

  // the wrapping element that scrolls, or MIGHT scroll if there's overflow.
  // TODO: do this for wrappers that have overflow:hidden as well.
  scrollEl: any

  isInteracting: boolean = false
  isDistanceSurpassed: boolean = false
  isDelayEnded: boolean = false
  isDragging: boolean = false
  isTouch: boolean = false
  isGeneric: boolean = false // initiated by 'dragstart' (jqui)

  delay: any
  delayTimeoutId: any
  minDistance: any

  shouldCancelTouchScroll: boolean = true
  scrollAlwaysKills: boolean = false

  isAutoScroll: boolean = false

  scrollBounds: any // { top, bottom, left, right }
  scrollTopVel: any // pixels per second
  scrollLeftVel: any // pixels per second
  scrollIntervalId: any // ID of setTimeout for scrolling animation loop

  // defaults
  scrollSensitivity: number = 30 // pixels from edge for scrolling to start
  scrollSpeed: number = 200 // pixels per second, at maximum speed
  scrollIntervalMs: number = 50 // millisecond wait between scroll increment


  constructor(options) {
    this.options = options || {}
  }


  // Interaction (high-level)
  // -----------------------------------------------------------------------------------------------------------------


  startInteraction(ev, extraOptions: any= {}) {

    if (ev.type === 'mousedown') {
      if (GlobalEmitter.get().shouldIgnoreMouse()) {
        return
      } else if (!isPrimaryMouseButton(ev)) {
        return
      } else {
        ev.preventDefault() // prevents native selection in most browsers
      }
    }

    if (!this.isInteracting) {

      // process options
      this.delay = firstDefined(extraOptions.delay, this.options.delay, 0)
      this.minDistance = firstDefined(extraOptions.distance, this.options.distance, 0)
      this.subjectEl = this.options.subjectEl

      preventSelection($('body'))

      this.isInteracting = true
      this.isTouch = getEvIsTouch(ev)
      this.isGeneric = ev.type === 'dragstart'
      this.isDelayEnded = false
      this.isDistanceSurpassed = false

      this.originX = getEvX(ev)
      this.originY = getEvY(ev)
      this.scrollEl = getScrollParent($(ev.target))

      this.bindHandlers()
      this.initAutoScroll()
      this.handleInteractionStart(ev)
      this.startDelay(ev)

      if (!this.minDistance) {
        this.handleDistanceSurpassed(ev)
      }
    }
  }


  handleInteractionStart(ev) {
    this.trigger('interactionStart', ev)
  }


  endInteraction(ev, isCancelled) {
    if (this.isInteracting) {
      this.endDrag(ev)

      if (this.delayTimeoutId) {
        clearTimeout(this.delayTimeoutId)
        this.delayTimeoutId = null
      }

      this.destroyAutoScroll()
      this.unbindHandlers()

      this.isInteracting = false
      this.handleInteractionEnd(ev, isCancelled)

      allowSelection($('body'))
    }
  }


  handleInteractionEnd(ev, isCancelled) {
    this.trigger('interactionEnd', ev, isCancelled || false)
  }


  // Binding To DOM
  // -----------------------------------------------------------------------------------------------------------------


  bindHandlers() {
    // some browsers (Safari in iOS 10) don't allow preventDefault on touch events that are bound after touchstart,
    // so listen to the GlobalEmitter singleton, which is always bound, instead of the document directly.
    let globalEmitter = GlobalEmitter.get()

    if (this.isGeneric) {
      this.listenTo($(document), { // might only work on iOS because of GlobalEmitter's bind :(
        drag: this.handleMove,
        dragstop: this.endInteraction
      })
    } else if (this.isTouch) {
      this.listenTo(globalEmitter, {
        touchmove: this.handleTouchMove,
        touchend: this.endInteraction,
        scroll: this.handleTouchScroll
      })
    } else {
      this.listenTo(globalEmitter, {
        mousemove: this.handleMouseMove,
        mouseup: this.endInteraction
      })
    }

    this.listenTo(globalEmitter, {
      selectstart: preventDefault, // don't allow selection while dragging
      contextmenu: preventDefault // long taps would open menu on Chrome dev tools
    })
  }


  unbindHandlers() {
    this.stopListeningTo(GlobalEmitter.get())
    this.stopListeningTo($(document)) // for isGeneric
  }


  // Drag (high-level)
  // -----------------------------------------------------------------------------------------------------------------


  // extraOptions ignored if drag already started
  startDrag(ev, extraOptions?) {
    this.startInteraction(ev, extraOptions) // ensure interaction began

    if (!this.isDragging) {
      this.isDragging = true
      this.handleDragStart(ev)
    }
  }


  handleDragStart(ev) {
    this.trigger('dragStart', ev)
  }


  handleMove(ev) {
    let dx = getEvX(ev) - this.originX
    let dy = getEvY(ev) - this.originY
    let minDistance = this.minDistance
    let distanceSq // current distance from the origin, squared

    if (!this.isDistanceSurpassed) {
      distanceSq = dx * dx + dy * dy
      if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
        this.handleDistanceSurpassed(ev)
      }
    }

    if (this.isDragging) {
      this.handleDrag(dx, dy, ev)
    }
  }


  // Called while the mouse is being moved and when we know a legitimate drag is taking place
  handleDrag(dx, dy, ev) {
    this.trigger('drag', dx, dy, ev)
    this.updateAutoScroll(ev) // will possibly cause scrolling
  }


  endDrag(ev) {
    if (this.isDragging) {
      this.isDragging = false
      this.handleDragEnd(ev)
    }
  }


  handleDragEnd(ev) {
    this.trigger('dragEnd', ev)
  }


  // Delay
  // -----------------------------------------------------------------------------------------------------------------


  startDelay(initialEv) {
    if (this.delay) {
      this.delayTimeoutId = setTimeout(() => {
        this.handleDelayEnd(initialEv)
      }, this.delay)
    } else {
      this.handleDelayEnd(initialEv)
    }
  }


  handleDelayEnd(initialEv) {
    this.isDelayEnded = true

    if (this.isDistanceSurpassed) {
      this.startDrag(initialEv)
    }
  }


  // Distance
  // -----------------------------------------------------------------------------------------------------------------


  handleDistanceSurpassed(ev) {
    this.isDistanceSurpassed = true

    if (this.isDelayEnded) {
      this.startDrag(ev)
    }
  }


  // Mouse / Touch
  // -----------------------------------------------------------------------------------------------------------------


  handleTouchMove(ev) {

    // prevent inertia and touchmove-scrolling while dragging
    if (this.isDragging && this.shouldCancelTouchScroll) {
      ev.preventDefault()
    }

    this.handleMove(ev)
  }


  handleMouseMove(ev) {
    this.handleMove(ev)
  }


  // Scrolling (unrelated to auto-scroll)
  // -----------------------------------------------------------------------------------------------------------------


  handleTouchScroll(ev) {
    // if the drag is being initiated by touch, but a scroll happens before
    // the drag-initiating delay is over, cancel the drag
    if (!this.isDragging || this.scrollAlwaysKills) {
      this.endInteraction(ev, true) // isCancelled=true
    }
  }


  // Utils
  // -----------------------------------------------------------------------------------------------------------------


  // Triggers a callback. Calls a function in the option hash of the same name.
  // Arguments beyond the first `name` are forwarded on.
  trigger(name, ...args) {
    if (this.options[name]) {
      this.options[name].apply(this, args)
    }
    // makes _methods callable by event name. TODO: kill this
    if (this['_' + name]) {
      this['_' + name].apply(this, args)
    }
  }


  // Auto-scroll
  // -----------------------------------------------------------------------------------------------------------------


  initAutoScroll() {
    let scrollEl = this.scrollEl

    this.isAutoScroll =
      this.options.scroll &&
      scrollEl &&
      !scrollEl.is(window) &&
      !scrollEl.is(document)

    if (this.isAutoScroll) {
      // debounce makes sure rapid calls don't happen
      this.listenTo(scrollEl, 'scroll', debounce(this.handleDebouncedScroll, 100))
    }
  }


  destroyAutoScroll() {
    this.endAutoScroll() // kill any animation loop

    // remove the scroll handler if there is a scrollEl
    if (this.isAutoScroll) {
      this.stopListeningTo(this.scrollEl, 'scroll') // will probably get removed by unbindHandlers too :(
    }
  }


  // Computes and stores the bounding rectangle of scrollEl
  computeScrollBounds() {
    if (this.isAutoScroll) {
      this.scrollBounds = getOuterRect(this.scrollEl)
      // TODO: use getClientRect in future. but prevents auto scrolling when on top of scrollbars
    }
  }


  // Called when the dragging is in progress and scrolling should be updated
  updateAutoScroll(ev) {
    let sensitivity = this.scrollSensitivity
    let bounds = this.scrollBounds
    let topCloseness
    let bottomCloseness
    let leftCloseness
    let rightCloseness
    let topVel = 0
    let leftVel = 0

    if (bounds) { // only scroll if scrollEl exists

      // compute closeness to edges. valid range is from 0.0 - 1.0
      topCloseness = (sensitivity - (getEvY(ev) - bounds.top)) / sensitivity
      bottomCloseness = (sensitivity - (bounds.bottom - getEvY(ev))) / sensitivity
      leftCloseness = (sensitivity - (getEvX(ev) - bounds.left)) / sensitivity
      rightCloseness = (sensitivity - (bounds.right - getEvX(ev))) / sensitivity

      // translate vertical closeness into velocity.
      // mouse must be completely in bounds for velocity to happen.
      if (topCloseness >= 0 && topCloseness <= 1) {
        topVel = topCloseness * this.scrollSpeed * -1 // negative. for scrolling up
      } else if (bottomCloseness >= 0 && bottomCloseness <= 1) {
        topVel = bottomCloseness * this.scrollSpeed
      }

      // translate horizontal closeness into velocity
      if (leftCloseness >= 0 && leftCloseness <= 1) {
        leftVel = leftCloseness * this.scrollSpeed * -1 // negative. for scrolling left
      } else if (rightCloseness >= 0 && rightCloseness <= 1) {
        leftVel = rightCloseness * this.scrollSpeed
      }
    }

    this.setScrollVel(topVel, leftVel)
  }


  // Sets the speed-of-scrolling for the scrollEl
  setScrollVel(topVel, leftVel) {

    this.scrollTopVel = topVel
    this.scrollLeftVel = leftVel

    this.constrainScrollVel() // massages into realistic values

    // if there is non-zero velocity, and an animation loop hasn't already started, then START
    if ((this.scrollTopVel || this.scrollLeftVel) && !this.scrollIntervalId) {
      this.scrollIntervalId = setInterval(
        proxy(this, 'scrollIntervalFunc'), // scope to `this`
        this.scrollIntervalMs
      )
    }
  }


  // Forces scrollTopVel and scrollLeftVel to be zero if scrolling has already gone all the way
  constrainScrollVel() {
    let el = this.scrollEl

    if (this.scrollTopVel < 0) { // scrolling up?
      if (el.scrollTop() <= 0) { // already scrolled all the way up?
        this.scrollTopVel = 0
      }
    } else if (this.scrollTopVel > 0) { // scrolling down?
      if (el.scrollTop() + el[0].clientHeight >= el[0].scrollHeight) { // already scrolled all the way down?
        this.scrollTopVel = 0
      }
    }

    if (this.scrollLeftVel < 0) { // scrolling left?
      if (el.scrollLeft() <= 0) { // already scrolled all the left?
        this.scrollLeftVel = 0
      }
    } else if (this.scrollLeftVel > 0) { // scrolling right?
      if (el.scrollLeft() + el[0].clientWidth >= el[0].scrollWidth) { // already scrolled all the way right?
        this.scrollLeftVel = 0
      }
    }
  }


  // This function gets called during every iteration of the scrolling animation loop
  scrollIntervalFunc() {
    let el = this.scrollEl
    let frac = this.scrollIntervalMs / 1000 // considering animation frequency, what the vel should be mult'd by

    // change the value of scrollEl's scroll
    if (this.scrollTopVel) {
      el.scrollTop(el.scrollTop() + this.scrollTopVel * frac)
    }
    if (this.scrollLeftVel) {
      el.scrollLeft(el.scrollLeft() + this.scrollLeftVel * frac)
    }

    this.constrainScrollVel() // since the scroll values changed, recompute the velocities

    // if scrolled all the way, which causes the vels to be zero, stop the animation loop
    if (!this.scrollTopVel && !this.scrollLeftVel) {
      this.endAutoScroll()
    }
  }


  // Kills any existing scrolling animation loop
  endAutoScroll() {
    if (this.scrollIntervalId) {
      clearInterval(this.scrollIntervalId)
      this.scrollIntervalId = null

      this.handleScrollEnd()
    }
  }


  // Get called when the scrollEl is scrolled (NOTE: this is delayed via debounce)
  handleDebouncedScroll() {
    // recompute all coordinates, but *only* if this is *not* part of our scrolling animation
    if (!this.scrollIntervalId) {
      this.handleScrollEnd()
    }
  }


  handleScrollEnd() {
    // Called when scrolling has stopped, whether through auto scroll, or the user scrolling
  }

}

ListenerMixin.mixInto(DragListener)
