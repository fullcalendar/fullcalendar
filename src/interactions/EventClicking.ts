import DateComponent from '../component/DateComponent'
import { listenBySelector } from '../util/dom-event'
import { getElSeg } from '../component/renderers/EventRenderer'

/*
Detects when the user clicks on an event within a DateComponent
*/
export default class EventClicking {

  component: DateComponent
  destroy: () => void

  constructor(component: DateComponent) {
    this.component = component

    this.destroy = listenBySelector(
      component.el,
      'click',
      component.segSelector,
      this.handleSegClick
    )
  }

  handleSegClick = (ev: Event, segEl: HTMLElement) => {
    let { component } = this
    let seg = getElSeg(segEl)!

    if (component.isValidSegDownEl(ev.target as HTMLElement)) {
      component.publiclyTrigger('eventClick', [
        {
          event: seg.eventRange!.eventInstance, // TODO: correct arg!
          jsEvent: ev,
          view: component.view
        }
      ])
    }
  }

}
