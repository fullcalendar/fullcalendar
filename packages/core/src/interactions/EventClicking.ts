import { listenBySelector } from '../util/dom-event'
import EventApi from '../api/EventApi'
import { elementClosest } from '../util/dom-manip'
import { getElSeg } from '../component/event-rendering'
import { Interaction, InteractionSettings } from './interaction'

/*
Detects when the user clicks on an event within a DateComponent
*/
export default class EventClicking extends Interaction {

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    this.destroy = listenBySelector(
      component.el,
      'click',
      component.fgSegSelector + ',' + component.bgSegSelector,
      this.handleSegClick
    )
  }

  handleSegClick = (ev: Event, segEl: HTMLElement) => {
    let { component } = this
    let { calendar, view } = component.context
    let seg = getElSeg(segEl)

    if (
      seg && // might be the <div> surrounding the more link
      component.isValidSegDownEl(ev.target as HTMLElement)
    ) {

      // our way to simulate a link click for elements that can't be <a> tags
      // grab before trigger fired in case trigger trashes DOM thru rerendering
      let hasUrlContainer = elementClosest(ev.target as HTMLElement, '.fc-has-url')
      let url = hasUrlContainer ? (hasUrlContainer.querySelector('a[href]') as any).href : ''

      calendar.publiclyTrigger('eventClick', [
        {
          el: segEl,
          event: new EventApi(
            component.context.calendar,
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
          view
        }
      ])

      if (url && !ev.defaultPrevented) {
        window.location.href = url
      }
    }
  }

}
