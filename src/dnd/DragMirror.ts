import IntentfulDragListener from '../dnd/IntentfulDragListener'
import { PointerDragEvent } from '../dnd/PointerDragListener'
import { removeElement, applyStyle } from '../util/dom-manip'
import { computeRect } from '../util/dom-geom'
import { whenTransitionDone } from '../util/dom-event'

export default class DragMirror {

  dragListener: IntentfulDragListener
  isEnabled: boolean = false
  pointerDownX: number
  pointerDownY: number
  deltaX: number
  deltaY: number
  sourceEl: HTMLElement
  mirrorEl: HTMLElement
  sourceElRect: any
  needsRevert: boolean = true
  revertDuration: number = 1000
  isReverting: boolean = false
  revertDoneCallback: any

  constructor(dragListener: IntentfulDragListener) {
    this.dragListener = dragListener
    dragListener.on('pointerdown', this.onPointerDown)
    dragListener.on('dragstart', this.onDragStart)
    dragListener.on('dragmove', this.onDragMove)
    dragListener.on('pointerup', this.onPointerUp)
  }

  enable() {
    if (!this.isEnabled) {
      this.isEnabled = true

      if (this.dragListener.isDragging) {

        if (this.mirrorEl) {
          this.mirrorEl.style.display = ''
        }

        this.updateElPosition()
      }
    }
  }

  disable() {
    if (this.isEnabled) {
      this.isEnabled = false

      if (this.mirrorEl) {
        this.mirrorEl.style.display = 'none'
      }
    }
  }

  onPointerDown = (ev: PointerDragEvent) => {
    this.pointerDownX = ev.pageX
    this.pointerDownY = ev.pageY
    this.sourceEl = ev.el
  }

  onDragStart = (ev: PointerDragEvent) => {
    this.handleDragEvent(ev)
  }

  onDragMove = (ev: PointerDragEvent) => {
    this.handleDragEvent(ev)
  }

  onPointerUp = (ev: PointerDragEvent) => {

    if (this.mirrorEl) {

      if (this.isEnabled && this.needsRevert && (this.deltaX || this.deltaY)) {
        this.revertAndRemove(this.mirrorEl)
      } else {
        removeElement(this.mirrorEl)
      }

      this.mirrorEl = null
    }

    this.sourceEl = null
    this.sourceElRect = null // so knows to recompute next time
  }

  // can happen after drag has finished and a new one begins
  revertAndRemove(mirrorEl) {
    this.isReverting = true

    mirrorEl.style.transition =
      'top ' + this.revertDuration + 'ms,' +
      'left ' + this.revertDuration + 'ms'

    applyStyle(mirrorEl, {
      left: this.sourceElRect.left,
      top: this.sourceElRect.top
    })

    whenTransitionDone(mirrorEl, () => {
      mirrorEl.style.transition = ''
      removeElement(mirrorEl)
      this.isReverting = false

      if (this.revertDoneCallback) {
        this.revertDoneCallback()
        this.revertDoneCallback = null
      }
    })
  }

  handleDragEvent(ev: PointerDragEvent) {
    this.deltaX = ev.pageX - this.pointerDownX
    this.deltaY = ev.pageY - this.pointerDownY
    this.updateElPosition()
  }

  updateElPosition() {
    if (this.isEnabled) {

      if (!this.sourceElRect) {
        this.sourceElRect = computeRect(this.sourceEl)
      }

      applyStyle(this.getMirrorEl(), {
        left: this.sourceElRect.left + this.deltaX,
        top: this.sourceElRect.top + this.deltaY
      })
    }
  }

  getMirrorEl(): HTMLElement {
    let mirrorEl = this.mirrorEl

    if (!mirrorEl) {
      mirrorEl = this.mirrorEl = this.sourceEl.cloneNode(true) as HTMLElement // cloneChildren=true
      // we don't want long taps or any mouse interaction causing selection/menus.
      // would use preventSelection(), but that prevents selectstart, causing problems.
      mirrorEl.classList.add('fc-unselectable')

      // if (this.options.additionalClass) {
      //   mirrorEl.classList.add(this.options.additionalClass)
      // }

      // TODO: do fixed positioning?
      // TODO: how would that work with auto-scrolling?
      // TODO: attache to .fc so that `.fc fc-not-end` will work

      applyStyle(mirrorEl, {
        position: 'absolute',
        visibility: '', // in case original element was hidden (commonly through hideEvents())
        margin: 0,
        right: 'auto', // erase and set width instead
        bottom: 'auto', // erase and set height instead

        // vvv use sourceElRect instead?
        width: this.sourceEl.offsetWidth, // explicit height in case there was a 'right' value
        height: this.sourceEl.offsetHeight, // explicit width in case there was a 'bottom' value
        //opacity: this.options.opacity || '',
        //zIndex: this.options.zIndex
      })

      document.body.appendChild(mirrorEl)
    }

    return mirrorEl
  }

}
