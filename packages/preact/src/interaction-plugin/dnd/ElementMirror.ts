import classNames from '../../styles.module.css'
import { applyStyle } from '../../util/dom-manip'
import { whenTransitionDone } from '../../util/dom-event'
import type { Rect } from '../../util/geom'

/*
An effect in which an element follows the movement of a pointer across the screen.
The moving element is a clone of some other element.
Must call start + handleMove + stop.
*/
export class ElementMirror {
  isVisible: boolean = false // must be explicitly enabled
  origScreenX?: number
  origScreenY?: number
  deltaX?: number
  deltaY?: number
  sourceEl: HTMLElement | null = null
  mirrorEl: HTMLElement | null = null
  sourceElRect: Rect | null = null // screen coords relative to viewport

  // options that can be set directly by caller
  parentNode: HTMLElement = document.body // HIGHLY SUGGESTED to set this to sidestep ShadowDOM issues
  zIndex: number = 9999
  revertDuration: number = 0
  colorScheme: string = ''

  start(sourceEl: HTMLElement, pageX: number, pageY: number) {
    this.sourceEl = sourceEl
    this.sourceElRect = this.sourceEl.getBoundingClientRect()
    this.origScreenX = pageX - window.scrollX
    this.origScreenY = pageY - window.scrollY
    this.deltaX = 0
    this.deltaY = 0
    this.updateElPosition()
  }

  handleMove(pageX: number, pageY: number) {
    this.deltaX = (pageX - window.scrollX) - this.origScreenX!
    this.deltaY = (pageY - window.scrollY) - this.origScreenY!
    this.updateElPosition()
  }

  // can be called before start
  setIsVisible(bool: boolean) {
    if (bool) {
      if (!this.isVisible) {
        if (this.mirrorEl) {
          // important because competes with util.module.css classNames, which are all important
          // TODO: attach a util className here instead?
          this.mirrorEl.style.setProperty('display', '', 'important')
        }

        this.isVisible = bool // needs to happen before updateElPosition
        this.updateElPosition() // because was not updating the position while invisible
      }
    } else if (this.isVisible) {
      if (this.mirrorEl) {
        // important because competes with util.module.css classNames, which are all important
        // TODO: attach a util className here instead?
        this.mirrorEl.style.setProperty('display', 'none', 'important')
      }

      this.isVisible = bool
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
      top: finalSourceElRect.top,
    })

    whenTransitionDone(mirrorEl, () => {
      mirrorEl.style.transition = ''
      callback()
    })
  }

  cleanup() {
    if (this.mirrorEl) {
      this.mirrorEl.remove()
      this.mirrorEl = null
    }

    this.sourceEl = null
  }

  updateElPosition() {
    if (this.sourceEl && this.isVisible) {
      applyStyle(this.getMirrorEl(), {
        left: this.sourceElRect!.left + this.deltaX!,
        top: this.sourceElRect!.top + this.deltaY!,
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
      // TODO: make className for this?
      mirrorEl.style.userSelect = 'none'
      mirrorEl.style.webkitUserSelect = 'none'
      mirrorEl.style.pointerEvents = 'none'

      if (this.colorScheme) {
        mirrorEl.setAttribute('data-color-scheme', this.colorScheme)
      }
      mirrorEl.classList.add(classNames.borderBoxRoot)

      applyStyle(mirrorEl, {
        position: 'fixed',
        zIndex: this.zIndex,
        visibility: '', // in case original element was hidden by the drag effect
        width: sourceElRect.right - sourceElRect.left, // explicit height in case there was a 'right' value
        height: sourceElRect.bottom - sourceElRect.top, // explicit width in case there was a 'bottom' value
        right: 'auto', // erase and set width instead
        bottom: 'auto', // erase and set height instead
        margin: 0,
      })

      this.parentNode.appendChild(mirrorEl)
    }

    return mirrorEl
  }
}
