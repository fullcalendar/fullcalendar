import { listenToHoverBySelector } from '../util/dom-event'
import { EventApi } from '../api/EventApi'
import { getElSeg } from '../component/event-rendering'
import { Interaction, InteractionSettings } from './interaction'

/*
Triggers events and adds/removes core classNames when the user's pointer
enters/leaves event-elements of a component.
*/
export class EventHovering extends Interaction {

  removeHoverListeners: () => void
  currentSegEl: HTMLElement

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    this.removeHoverListeners = listenToHoverBySelector(
      settings.el,
      '.fc-event', // on both fg and bg events
      this.handleSegEnter,
      this.handleSegLeave
    )

    // how to make sure component already has context?
    component.context.calendar.on('eventElRemove', this.handleEventElRemove)
  }

  destroy() {
    this.removeHoverListeners()
    this.component.context.calendar.off('eventElRemove', this.handleEventElRemove)
  }

  // for simulating an eventMouseLeave when the event el is destroyed while mouse is over it
  handleEventElRemove = (el: HTMLElement) => {
    if (el === this.currentSegEl) {
      this.handleSegLeave(null, this.currentSegEl)
    }
  }

  handleSegEnter = (ev: Event, segEl: HTMLElement) => {
    if (getElSeg(segEl)) { // TODO: better way to make sure not hovering over more+ link or its wrapper
      segEl.classList.add('fc-event-resizable-mouse')
      this.currentSegEl = segEl
      this.triggerEvent('eventMouseEnter', ev, segEl)
    }
  }

  handleSegLeave = (ev: Event | null, segEl: HTMLElement) => {
    if (this.currentSegEl) {
      segEl.classList.remove('fc-event-resizable-mouse')
      this.currentSegEl = null
      this.triggerEvent('eventMouseLeave', ev, segEl)
    }
  }

  triggerEvent(publicEvName: 'eventMouseEnter' | 'eventMouseLeave', ev: Event | null, segEl: HTMLElement) {
    let { component } = this
    let { calendar, view } = component.context
    let seg = getElSeg(segEl)!

    if (!ev || component.isValidSegDownEl(ev.target as HTMLElement)) {
      calendar.publiclyTrigger(publicEvName, [
        {
          el: segEl,
          event: new EventApi(
            calendar,
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
          view
        }
      ])
    }
  }

}
