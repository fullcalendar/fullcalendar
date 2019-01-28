import { removeElement, applyStyle, whenTransitionDone, Rect } from '@fullcalendar/core'

/*
An effect in which an element follows the movement of a pointer across the screen.
The moving element is a clone of some other element.
Must call start + handleMove + stop.
*/
export default class ElementMirror {

  isVisible: boolean = false // must be explicitly enabled
  origScreenX?: number
  origScreenY?: number
  deltaX?: number
  deltaY?: number
  sourceEl: HTMLElement | null = null
  mirrorEl: HTMLElement | null = null
  sourceElRect: Rect | null = null // screen coords relative to viewport

  // options that can be set directly by caller
  parentNode: HTMLElement = document.body
  zIndex: number = 9999
  revertDuration: number = 0

  start(sourceEl: HTMLElement, pageX: number, pageY: number) {
    this.sourceEl = sourceEl
    this.sourceElRect = this.sourceEl.getBoundingClientRect()
    this.origScreenX = pageX - window.pageXOffset
    this.origScreenY = pageY - window.pageYOffset
    this.deltaX = 0
    this.deltaY = 0
    this.updateElPosition()
  }

  handleMove(pageX: number, pageY: number) {
    this.deltaX = (pageX - window.pageXOffset) - this.origScreenX!
    this.deltaY = (pageY - window.pageYOffset) - this.origScreenY!
    this.updateElPosition()
  }

  // can be called before start
  setIsVisible(bool: boolean) {
    if (bool) {
      if (!this.isVisible) {
        if (this.mirrorEl) {
          this.mirrorEl.style.display = ''
        }

        this.isVisible = bool // needs to happen before updateElPosition
        this.updateElPosition() // because was not updating the position while invisible
      }
    } else {
      if (this.isVisible) {
        if (this.mirrorEl) {
          this.mirrorEl.style.display = 'none'
        }

        this.isVisible = bool
      }
    }
  }

  // always async
  stop(needsRevertAnimation: boolean, callback: () => void) {
    let done = () => {
      this.cleanup()
      callback()
    }

    if (
      needsRevertAnimation &&
      this.mirrorEl &&
      this.isVisible &&
      this.revertDuration && // if 0, transition won't work
      (this.deltaX || this.deltaY) // if same coords, transition won't work
    ) {
      this.doRevertAnimation(done, this.revertDuration)
    } else {
      setTimeout(done, 0)
    }
  }

  doRevertAnimation(callback: () => void, revertDuration: number) {
    let mirrorEl = this.mirrorEl!
    let finalSourceElRect = this.sourceEl!.getBoundingClientRect() // because autoscrolling might have happened

    mirrorEl.style.transition =
      'top ' + revertDuration + 'ms,' +
      'left ' + revertDuration + 'ms'

    applyStyle(mirrorEl, {
      left: finalSourceElRect.left,
      top: finalSourceElRect.top
    })

    whenTransitionDone(mirrorEl, () => {
      mirrorEl.style.transition = ''
      callback()
    })
  }

  cleanup() {
    if (this.mirrorEl) {
      removeElement(this.mirrorEl)
      this.mirrorEl = null
    }

    this.sourceEl = null
  }

  updateElPosition() {
    if (this.sourceEl && this.isVisible) {
      applyStyle(this.getMirrorEl(), {
        left: this.sourceElRect!.left + this.deltaX!,
        top: this.sourceElRect!.top + this.deltaY!
      })
    }
  }

  getMirrorEl(): HTMLElement {
    let sourceElRect = this.sourceElRect!
    let mirrorEl = this.mirrorEl

    if (!mirrorEl) {
      mirrorEl = this.mirrorEl = this.sourceEl!.cloneNode(true) as HTMLElement // cloneChildren=true

      // we don't want long taps or any mouse interaction causing selection/menus.
      // would use preventSelection(), but that prevents selectstart, causing problems.
      mirrorEl.classList.add('fc-unselectable')

      mirrorEl.classList.add('fc-dragging')

      applyStyle(mirrorEl, {
        position: 'fixed',
        zIndex: this.zIndex,
        visibility: '', // in case original element was hidden by the drag effect
        boxSizing: 'border-box', // for easy width/height
        width: sourceElRect.right - sourceElRect.left, // explicit height in case there was a 'right' value
        height: sourceElRect.bottom - sourceElRect.top, // explicit width in case there was a 'bottom' value
        right: 'auto', // erase and set width instead
        bottom: 'auto', // erase and set height instead
        margin: 0
      })

      this.parentNode.appendChild(mirrorEl)
    }

    return mirrorEl
  }

}
