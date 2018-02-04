import * as $ from 'jquery'
import {
  getEvY,
  getEvX,
  getEvIsTouch
} from '../util'
import { default as ListenerMixin, ListenerInterface } from './ListenerMixin'

/* Creates a clone of an element and lets it track the mouse as it moves
----------------------------------------------------------------------------------------------------------------------*/

export default class MouseFollower {

  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']

  options: any

  sourceEl: any // the element that will be cloned and made to look like it is dragging
  el: any // the clone of `sourceEl` that will track the mouse
  parentEl: any // the element that `el` (the clone) will be attached to

  // the initial position of el, relative to the offset parent. made to match the initial offset of sourceEl
  top0: any
  left0: any

  // the absolute coordinates of the initiating touch/mouse action
  y0: any
  x0: any

  // the number of pixels the mouse has moved from its initial position
  topDelta: any
  leftDelta: any

  isFollowing: boolean = false
  isHidden: boolean = false
  isAnimating: boolean = false // doing the revert animation?


  constructor(sourceEl, options) {
    this.options = options = options || {}
    this.sourceEl = sourceEl
    this.parentEl = options.parentEl ? $(options.parentEl) : sourceEl.parent() // default to sourceEl's parent
  }


  // Causes the element to start following the mouse
  start(ev) {
    if (!this.isFollowing) {
      this.isFollowing = true

      this.y0 = getEvY(ev)
      this.x0 = getEvX(ev)
      this.topDelta = 0
      this.leftDelta = 0

      if (!this.isHidden) {
        this.updatePosition()
      }

      if (getEvIsTouch(ev)) {
        this.listenTo($(document), 'touchmove', this.handleMove)
      } else {
        this.listenTo($(document), 'mousemove', this.handleMove)
      }
    }
  }


  // Causes the element to stop following the mouse. If shouldRevert is true, will animate back to original position.
  // `callback` gets invoked when the animation is complete. If no animation, it is invoked immediately.
  stop(shouldRevert, callback) {
    let revertDuration = this.options.revertDuration

    const complete = () => { // might be called by .animate(), which might change `this` context
      this.isAnimating = false
      this.removeElement()

      this.top0 = this.left0 = null // reset state for future updatePosition calls

      if (callback) {
        callback()
      }
    }

    if (this.isFollowing && !this.isAnimating) { // disallow more than one stop animation at a time
      this.isFollowing = false

      this.stopListeningTo($(document))

      if (shouldRevert && revertDuration && !this.isHidden) { // do a revert animation?
        this.isAnimating = true
        this.el.animate({
          top: this.top0,
          left: this.left0
        }, {
          duration: revertDuration,
          complete: complete
        })
      } else {
        complete()
      }
    }
  }


  // Gets the tracking element. Create it if necessary
  getEl() {
    let el = this.el

    if (!el) {
      el = this.el = this.sourceEl.clone()
        .addClass(this.options.additionalClass || '')
        .css({
          position: 'absolute',
          visibility: '', // in case original element was hidden (commonly through hideEvents())
          display: this.isHidden ? 'none' : '', // for when initially hidden
          margin: 0,
          right: 'auto', // erase and set width instead
          bottom: 'auto', // erase and set height instead
          width: this.sourceEl.width(), // explicit height in case there was a 'right' value
          height: this.sourceEl.height(), // explicit width in case there was a 'bottom' value
          opacity: this.options.opacity || '',
          zIndex: this.options.zIndex
        })

      // we don't want long taps or any mouse interaction causing selection/menus.
      // would use preventSelection(), but that prevents selectstart, causing problems.
      el.addClass('fc-unselectable')

      el.appendTo(this.parentEl)
    }

    return el
  }


  // Removes the tracking element if it has already been created
  removeElement() {
    if (this.el) {
      this.el.remove()
      this.el = null
    }
  }


  // Update the CSS position of the tracking element
  updatePosition() {
    let sourceOffset
    let origin

    this.getEl() // ensure this.el

    // make sure origin info was computed
    if (this.top0 == null) {
      sourceOffset = this.sourceEl.offset()
      origin = this.el.offsetParent().offset()
      this.top0 = sourceOffset.top - origin.top
      this.left0 = sourceOffset.left - origin.left
    }

    this.el.css({
      top: this.top0 + this.topDelta,
      left: this.left0 + this.leftDelta
    })
  }


  // Gets called when the user moves the mouse
  handleMove(ev) {
    this.topDelta = getEvY(ev) - this.y0
    this.leftDelta = getEvX(ev) - this.x0

    if (!this.isHidden) {
      this.updatePosition()
    }
  }


  // Temporarily makes the tracking element invisible. Can be called before following starts
  hide() {
    if (!this.isHidden) {
      this.isHidden = true
      if (this.el) {
        this.el.hide()
      }
    }
  }


  // Show the tracking element after it has been temporarily hidden
  show() {
    if (this.isHidden) {
      this.isHidden = false
      this.updatePosition()
      this.getEl().show()
    }
  }

}

ListenerMixin.mixInto(MouseFollower)
