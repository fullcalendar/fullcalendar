import { BaseComponent } from '../vdom-util'
import { EventRangeProps } from '../component-util/event-rendering'
import { EventInstanceHash } from '../structs/event-instance'
import { Hit } from '../interactions/hit'
import { guid } from '../util/misc'
import { Dictionary } from '../options'
import classNames from '../styles.module.css'

export type DateComponentHash = { [uid: string]: DateComponent<any, any> }

export interface EventSegUiInteractionState<S> {
  affectedInstances: EventInstanceHash
  segs: (S & EventRangeProps)[]
  isEvent: boolean
}

/*
an INTERACTABLE date component

PURPOSES:
- hook up to fg, fill, and mirror renderers
- interface for dragging and hits
*/
export abstract class DateComponent<Props=Dictionary, State=Dictionary> extends BaseComponent<Props, State> {
  uid = guid()

  // Hit System
  // -----------------------------------------------------------------------------------------------------------------

  prepareHits() {
  }

  queryHit(isRtl: boolean, positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit | null {
    return null // this should be abstract
  }

  // Pointer Interaction Utils
  // -----------------------------------------------------------------------------------------------------------------

  isValidSegDownEl(el: HTMLElement) {
    return !(this.props as any).eventDrag && // HACK
      !(this.props as any).eventResize && // HACK
      !el.closest(`.${classNames.internalEventMirror}`)
  }

  isValidDateDownEl(el: HTMLElement) {
    return !el.closest(
      `.${classNames.internalEvent}:not(.${classNames.internalBgEvent})`
    ) &&
      !el.closest(`.${classNames.internalMoreLink}`) &&
      !el.closest(`.${classNames.internalNavLink}`) &&
      !el.closest(`.${classNames.internalPopover}`) // hack
  }
}
