import { listenToHoverBySelector } from '../util/dom-event'
import { EventImpl } from '../api/EventImpl'
import { getElEventRange } from '../component-util/event-rendering'
import { Interaction, InteractionSettings } from './interaction'
import { ViewApi } from '../api/ViewApi'
import classNames from '../styles.module.css'

export interface EventHoveringInfo {
  el: HTMLElement
  event: EventImpl
  jsEvent: MouseEvent
  view: ViewApi
}

/*
Triggers events and adds/removes core classNames when the user's pointer
enters/leaves event-elements of a component.
*/
export class EventHovering extends Interaction {
  removeHoverListeners: () => void

  currentSegEl: HTMLElement

  constructor(settings: InteractionSettings) {
    super(settings)

    this.removeHoverListeners = listenToHoverBySelector(
      settings.el,
      `.${classNames.internalEvent}`, // on both fg and bg events
      this.handleSegEnter,
      this.handleSegLeave,
    )
  }

  destroy() {
    this.removeHoverListeners()
  }

  // for simulating an eventMouseLeave when the event el is destroyed while mouse is over it
  handleEventElRemove = (el: HTMLElement) => {
    if (el === this.currentSegEl) {
      this.handleSegLeave(null, this.currentSegEl)
    }
  }

  handleSegEnter = (ev: Event, segEl: HTMLElement) => {
    if (getElEventRange(segEl)) { // TODO: better way to make sure not hovering over more+ link or its wrapper
      this.currentSegEl = segEl
      this.triggerEvent('eventMouseEnter', ev, segEl)
    }
  }

  handleSegLeave = (ev: Event | null, segEl: HTMLElement) => {
    if (this.currentSegEl) {
      this.currentSegEl = null
      this.triggerEvent('eventMouseLeave', ev, segEl)
    }
  }

  triggerEvent(publicEvName: 'eventMouseEnter' | 'eventMouseLeave', ev: Event | null, segEl: HTMLElement) {
    let { component } = this
    let { context } = component
    let eventRange = getElEventRange(segEl)!

    if (!ev || component.isValidSegDownEl(ev.target as HTMLElement)) {
      context.emitter.trigger(publicEvName, {
        el: segEl,
        event: new EventImpl(
          context,
          eventRange.def,
          eventRange.instance,
        ),
        jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
        view: context.viewApi,
      } as EventHoveringInfo)
    }
  }
}
