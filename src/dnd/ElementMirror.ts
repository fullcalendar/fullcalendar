import { removeElement, applyStyle } from '../util/dom-manip'
import { computeRect } from '../util/dom-geom'
import { whenTransitionDone } from '../util/dom-event'

export default class ElementMirror {

  isVisible: boolean = false
  origX: number
  origY: number
  deltaX: number
  deltaY: number
  sourceEl: HTMLElement
  mirrorEl: HTMLElement
  sourceElRect: any
  revertDuration: number = 1000

  start(sourceEl, left, top) {
    this.sourceEl = sourceEl
    this.origX = left
    this.origY = top
    this.deltaX = 0
    this.deltaY = 0
    this.updateElPosition()
  }

  handleMove(left, top) {
    this.deltaX = left - this.origX
    this.deltaY = top - this.origY
    this.updateElPosition()
  }

  setIsVisible(bool: boolean) {
    if (bool) {
      if (!this.isVisible) {
        if (this.mirrorEl) {
          this.mirrorEl.style.display = ''
        }
        this.updateElPosition()
      }
    } else {
      if (this.isVisible) {
        if (this.mirrorEl) {
          this.mirrorEl.style.display = 'none'
        }
      }
    }

    this.isVisible = bool
  }

  // always async
  stop(doRevertAnimation, callback) {
    let done = () => {
      this.cleanup()
      callback()
    }

    if (doRevertAnimation && this.mirrorEl && this.isVisible) {
      this.doAnimation(done)
    } else {
      setTimeout(done, 0)
    }
  }

  doAnimation(callback) {
    let { mirrorEl } = this

    mirrorEl.style.transition =
      'top ' + this.revertDuration + 'ms,' +
      'left ' + this.revertDuration + 'ms'

    applyStyle(mirrorEl, {
      left: this.sourceElRect.left,
      top: this.sourceElRect.top
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
    if (this.isVisible) {
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
