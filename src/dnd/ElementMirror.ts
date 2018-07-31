import { removeElement, applyStyle } from '../util/dom-manip'
import { computeRect } from '../util/dom-geom'
import { whenTransitionDone } from '../util/dom-event'
import { Rect } from '../util/geom'

/*
An effect in which an element follows the movement of a pointer across the screen.
The moving element is a clone of some other element.
Must call start + handleMove + stop.
*/
export default class ElementMirror {

  isVisible: boolean = false
  origX?: number
  origY?: number
  deltaX?: number
  deltaY?: number
  sourceEl: HTMLElement | null = null
  mirrorEl: HTMLElement | null = null
  sourceElRect: Rect | null = null

  // options that can be set directly by caller
  // TODO: wire up
  revertDuration: number = 1000

  start(sourceEl: HTMLElement, left: number, top: number) {
    this.sourceEl = sourceEl
    this.origX = left
    this.origY = top
    this.deltaX = 0
    this.deltaY = 0
    this.updateElPosition()
  }

  handleMove(left: number, top: number) {
    this.deltaX = left - this.origX!
    this.deltaY = top - this.origY!
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
        this.updateElPosition()
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

    if (needsRevertAnimation && this.mirrorEl && this.isVisible) {
      this.doRevertAnimation(done)
    } else {
      setTimeout(done, 0)
    }
  }

  doRevertAnimation(callback: () => void) {
    let mirrorEl = this.mirrorEl!

    mirrorEl.style.transition =
      'top ' + this.revertDuration + 'ms,' +
      'left ' + this.revertDuration + 'ms'

    applyStyle(mirrorEl, {
      left: this.sourceElRect!.left,
      top: this.sourceElRect!.top
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
    this.sourceElRect = null // so knows to recompute next time
  }

  updateElPosition() {
    if (this.sourceEl && this.isVisible) {
      if (!this.sourceElRect) {
        this.sourceElRect = computeRect(this.sourceEl)
      }

      applyStyle(this.getMirrorEl(), {
        left: this.sourceElRect.left + this.deltaX!,
        top: this.sourceElRect.top + this.deltaY!
      })
    }
  }

  getMirrorEl(): HTMLElement {
    let mirrorEl = this.mirrorEl

    if (!mirrorEl) {
      mirrorEl = this.mirrorEl = this.sourceEl!.cloneNode(true) as HTMLElement // cloneChildren=true
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
        width: this.sourceEl!.offsetWidth, // explicit height in case there was a 'right' value
        height: this.sourceEl!.offsetHeight, // explicit width in case there was a 'bottom' value
        //opacity: this.options.opacity || '',
        //zIndex: this.options.zIndex
      })

      // TODO: appendTo setting
      document.body.appendChild(mirrorEl)
    }

    return mirrorEl
  }

}
