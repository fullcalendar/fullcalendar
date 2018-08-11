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
  destroy: () => void

  constructor(component: DateComponent) {
    this.component = component

    this.destroy = listenToHoverBySelector(
      component.el,
      component.segSelector,
      this.handleSegEnter,
      this.handleSegLeave
    )
  }

  handleSegEnter = (ev: Event, segEl: HTMLElement) => {
    segEl.classList.add('fc-allow-mouse-resize')
    this.triggerEvent('eventMouseover', ev, segEl)
  }

  handleSegLeave = (ev: Event, segEl: HTMLElement) => {
    segEl.classList.remove('fc-allow-mouse-resize')
    this.triggerEvent('eventMouseout', ev, segEl)
  }

  triggerEvent(publicEvName: string, ev: Event, segEl: HTMLElement) {
    let { component } = this
    let seg = getElSeg(segEl)!

    if (component.isValidSegDownEl(ev.target as HTMLElement)) {
      component.publiclyTrigger(publicEvName, [
        {
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
