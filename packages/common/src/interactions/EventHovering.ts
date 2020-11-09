import { listenToHoverBySelector } from '../util/dom-event'
import { EventApi } from '../api/EventApi'
import { getElSeg } from '../component/event-rendering'
import { Interaction, InteractionSettings } from './interaction'
import { ViewApi } from '../ViewApi'

export interface EventHoveringArg {
  el: HTMLElement
  event: EventApi
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
      '.fc-event', // on both fg and bg events
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
    if (getElSeg(segEl)) { // TODO: better way to make sure not hovering over more+ link or its wrapper
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
    let seg = getElSeg(segEl)!

    if (!ev || component.isValidSegDownEl(ev.target as HTMLElement)) {
      context.emitter.trigger(publicEvName, {
        el: segEl,
        event: new EventApi(
          context,
          seg.eventRange.def,
          seg.eventRange.instance,
        ),
        jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
        view: context.viewApi,
      } as EventHoveringArg)
    }
  }
}
