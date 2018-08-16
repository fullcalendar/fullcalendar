import DateComponent from '../component/DateComponent'
import { listenToHoverBySelector } from '../util/dom-event'
import { getElSeg } from '../component/renderers/EventRenderer'
import EventApi from '../api/EventApi'

/*
Triggers events and adds/removes core classNames when the user's pointer
enters/leaves event-elements of a component.
*/
export default class EventHovering {

  component: DateComponent
  removeHoverListeners: () => void
  currentSegEl: HTMLElement

  constructor(component: DateComponent) {
    this.component = component

    this.removeHoverListeners = listenToHoverBySelector(
      component.el,
      component.segSelector,
      this.handleSegEnter,
      this.handleSegLeave
    )

    // TODO: find less expensive way to do this. generates lots of EventApi's
    component.getCalendar().on('eventDestroy', this.handleEventDestroy)
  }

  destroy() {
    this.removeHoverListeners()
    this.component.getCalendar().off('eventDestroy', this.handleEventDestroy)
  }

  // for simulating an eventMouseout when the event el is destroyed while mouse is over it
  handleEventDestroy = (arg) => {
    if (arg.el === this.currentSegEl) {
      this.handleSegLeave(null, this.currentSegEl)
    }
  }

  handleSegEnter = (ev: Event, segEl: HTMLElement) => {
    segEl.classList.add('fc-allow-mouse-resize')
    this.currentSegEl = segEl
    this.triggerEvent('eventMouseover', ev, segEl)
  }

  handleSegLeave = (ev: Event | null, segEl: HTMLElement) => {
    segEl.classList.remove('fc-allow-mouse-resize')
    this.currentSegEl = null
    this.triggerEvent('eventMouseout', ev, segEl)
  }

  triggerEvent(publicEvName: string, ev: Event | null, segEl: HTMLElement) {
    let { component } = this
    let seg = getElSeg(segEl)!

    if (!ev || component.isValidSegDownEl(ev.target as HTMLElement)) {
      component.publiclyTrigger(publicEvName, [
        {
          el: segEl,
          event: new EventApi(
            this.component.getCalendar(),
            seg.eventRange.eventDef,
            seg.eventRange.eventInstance
          ),
          jsEvent: ev,
          view: component.view
        }
      ])
    }
  }

}
