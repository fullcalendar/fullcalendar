import InteractiveDateComponent from '../component/InteractiveDateComponent'
import { listenBySelector } from '../util/dom-event'

export default class EventClicking {

  component: InteractiveDateComponent
  destroy: () => void

  constructor(component: InteractiveDateComponent) {
    this.component = component
    this.destroy = listenBySelector(component.el, 'click', component.segSelector, this.onSegClick)
  }

  // PROBLEM: it's firing twice because dayGrid is within Month view

  onSegClick = (ev: UIEvent, segEl: HTMLElement) => {
    let { component } = this
    let seg = (segEl as any).fcSeg // put there by EventRenderer

    if (component.isValidSegInteraction(segEl as HTMLElement)) {
      let res = component.publiclyTrigger('eventClick', [ // can return `false` to cancel
        {
          event: seg.eventRange.eventInstance, // TODO: correct arg!
          jsEvent: ev,
          view: component.view
        }
      ])

      if (res === false) {
        ev.preventDefault() // don't visit link
      }
    }
  }

}
