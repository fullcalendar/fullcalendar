import { listenBySelector } from '../util/dom-event'
import { EventApi } from '../api/EventApi'
import { elementClosest } from '../util/dom-manip'
import { getElSeg } from '../component/event-rendering'
import { Interaction, InteractionSettings } from './interaction'
import { ViewApi } from '../ViewApi'

export interface EventClickArg {
  el: HTMLElement
  event: EventApi
  jsEvent: MouseEvent
  view: ViewApi
}

/*
Detects when the user clicks on an event within a DateComponent
*/
export class EventClicking extends Interaction {
  constructor(settings: InteractionSettings) {
    super(settings)

    this.destroy = listenBySelector(
      settings.el,
      'click',
      '.fc-event', // on both fg and bg events
      this.handleSegClick,
    )
  }

  handleSegClick = (ev: Event, segEl: HTMLElement) => {
    let { component } = this
    let { context } = component
    let seg = getElSeg(segEl)

    if (
      seg && // might be the <div> surrounding the more link
      component.isValidSegDownEl(ev.target as HTMLElement)
    ) {
      // our way to simulate a link click for elements that can't be <a> tags
      // grab before trigger fired in case trigger trashes DOM thru rerendering
      let hasUrlContainer = elementClosest(ev.target as HTMLElement, '.fc-event-forced-url')
      let url = hasUrlContainer ? (hasUrlContainer.querySelector('a[href]') as any).href : ''

      context.emitter.trigger('eventClick', {
        el: segEl,
        event: new EventApi(
          component.context,
          seg.eventRange.def,
          seg.eventRange.instance,
        ),
        jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
        view: context.viewApi,
      } as EventClickArg)

      if (url && !ev.defaultPrevented) {
        window.location.href = url
      }
    }
  }
}
