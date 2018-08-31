import DateComponent from '../component/DateComponent'
import { listenBySelector } from '../util/dom-event'
import { getElSeg } from '../component/renderers/EventRenderer'
import EventApi from '../api/EventApi'
import { elementClosest } from '../util/dom-manip'

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

      // our way to simulate a link click for elements that can't be <a> tags
      // grab before trigger fired in case trigger trashes DOM thru rerendering
      let hasUrlContainer = elementClosest(ev.target as HTMLElement, '.fc-has-url')
      let url = hasUrlContainer ? (hasUrlContainer.querySelector('a[href]') as any).href : ''

      component.publiclyTrigger('eventClick', [
        {
          el: segEl,
          event: new EventApi(
            component.getCalendar(),
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          jsEvent: ev,
          view: component.view
        }
      ])

      if (url && !ev.defaultPrevented) {
        window.location.href = url
      }
    }
  }

}
