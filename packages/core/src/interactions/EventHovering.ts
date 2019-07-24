import { listenToHoverBySelector } from '../util/dom-event'
import EventApi from '../api/EventApi'
import { getElSeg } from '../component/event-rendering'
import { Interaction, InteractionSettings } from './interaction'

/*
Triggers events and adds/removes core classNames when the user's pointer
enters/leaves event-elements of a component.
*/
export default class EventHovering extends Interaction {

  removeHoverListeners: () => void
  currentSegEl: HTMLElement

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    this.removeHoverListeners = listenToHoverBySelector(
      component.el,
      component.fgSegSelector + ',' + component.bgSegSelector,
      this.handleSegEnter,
      this.handleSegLeave
    )

    component.calendar.on('eventElRemove', this.handleEventElRemove)
  }

  destroy() {
    this.removeHoverListeners()
    this.component.calendar.off('eventElRemove', this.handleEventElRemove)
  }

  // for simulating an eventMouseLeave when the event el is destroyed while mouse is over it
  handleEventElRemove = (el: HTMLElement) => {
    if (el === this.currentSegEl) {
      this.handleSegLeave(null, this.currentSegEl)
    }
  }

  handleSegEnter = (ev: Event, segEl: HTMLElement) => {
    if (getElSeg(segEl)) { // TODO: better way to make sure not hovering over more+ link or its wrapper
      segEl.classList.add('fc-allow-mouse-resize')
      this.currentSegEl = segEl
      this.triggerEvent('eventMouseEnter', ev, segEl)
    }
  }

  handleSegLeave = (ev: Event | null, segEl: HTMLElement) => {
    if (this.currentSegEl) {
      segEl.classList.remove('fc-allow-mouse-resize')
      this.currentSegEl = null
      this.triggerEvent('eventMouseLeave', ev, segEl)
    }
  }

  triggerEvent(publicEvName: 'eventMouseEnter' | 'eventMouseLeave', ev: Event | null, segEl: HTMLElement) {
    let { component } = this
    let seg = getElSeg(segEl)!

    if (!ev || component.isValidSegDownEl(ev.target as HTMLElement)) {
      component.publiclyTrigger(publicEvName, [
        {
          el: segEl,
          event: new EventApi(
            this.component.calendar,
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
          view: component.view
        }
      ])
    }
  }

}
