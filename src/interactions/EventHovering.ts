import DateComponent from '../component/DateComponent'
import { listenToHoverBySelector } from '../util/dom-event'

export default class EventHovering {

  component: DateComponent
  destroy: () => void

  constructor(component: DateComponent) {
    this.component = component
    this.destroy = listenToHoverBySelector(
      component.el,
      component.segSelector,
      this.handleSegEv.bind(this, 'eventMouseover'),
      this.handleSegEv.bind(this, 'eventMouseout')
    )
  }

  handleSegEv(triggerType: string, ev: UIEvent, segEl: HTMLElement) {
    let { component } = this
    let seg = (segEl as any).fcSeg // put there by EventRenderer

    if (triggerType === 'eventMouseover') { // LAME way to test
      segEl.classList.add('fc-allow-mouse-resize')
    } else {
      segEl.classList.remove('fc-allow-mouse-resize')
    }

    if (component.isValidSegInteraction(segEl as HTMLElement)) {
      component.publiclyTrigger(triggerType, [
        {
          event: seg.eventRange.eventInstance, // TODO: correct arg!
          jsEvent: ev,
          view: component.view
        }
      ])
    }
  }

}
