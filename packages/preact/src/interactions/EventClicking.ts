import { listenBySelector } from '../util/dom-event'
import { EventImpl } from '../api/EventImpl'
import { getElEventRange } from '../component-util/event-rendering'
import { Interaction, InteractionSettings } from './interaction'
import { ViewApi } from '../api/ViewApi'
import classNames from '../styles.module.css'

export interface EventClickInfo {
  el: HTMLElement
  event: EventImpl
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
      `.${classNames.internalEvent}`, // on both fg and bg events
      this.handleSegClick,
    )
  }

  handleSegClick = (ev: Event, segEl: HTMLElement) => {
    let { component } = this
    let { context } = component
    let eventRange = getElEventRange(segEl)

    if (
      eventRange && // might be the <div> surrounding the more link
      component.isValidSegDownEl(ev.target as HTMLElement)
    ) {
      context.emitter.trigger('eventClick', {
        el: segEl,
        event: new EventImpl(
          component.context,
          eventRange.def,
          eventRange.instance,
        ),
        jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
        view: context.viewApi,
      } as EventClickInfo)
    }
  }
}
