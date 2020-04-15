import { BaseComponent } from '../vdom-util'
import { EventRenderRange } from './event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInstanceHash } from '../structs/event'
import { rangeContainsRange } from '../datelib/date-range'
import { Hit } from '../interactions/hit'
import { elementClosest } from '../util/dom-manip'
import { isDateSelectionValid, isInteractionValid } from '../validation'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { guid } from '../util/misc'

export type DateComponentHash = { [uid: string]: DateComponent<any, any> }

// NOTE: for fg-events, eventRange.range is NOT sliced,
// thus, we need isStart/isEnd
export interface Seg {
  component?: DateComponent<any, any>
  isStart: boolean
  isEnd: boolean
  eventRange?: EventRenderRange
  [otherProp: string]: any // TODO: remove this. extending Seg will handle this
  el?: never
  // NOTE: can sometimes have start/end, which are important values :(
}

export interface EventSegUiInteractionState {
  affectedInstances: EventInstanceHash
  segs: Seg[]
  isEvent: boolean
}

/*
an INTERACTABLE date component

PURPOSES:
- hook up to fg, fill, and mirror renderers
- interface for dragging and hits
*/
export abstract class DateComponent<Props={}, State={}> extends BaseComponent<Props, State> {

  uid = guid()

  // IN SCHEDULER: allowAcrossResources

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any


  // Hit System
  // -----------------------------------------------------------------------------------------------------------------


  prepareHits() {
  }


  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit | null {
    return null // this should be abstract
  }


  // Validation
  // -----------------------------------------------------------------------------------------------------------------

  isInteractionValid(interaction: EventInteractionState) {
    let { calendar } = this.context
    let dateProfile = (this.props as any).dateProfile // HACK
    let instances = interaction.mutatedEvents.instances

    if (dateProfile) { // HACK for MorePopover
      for (let instanceId in instances) {
        if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
          return false
        }
      }
    }

    return isInteractionValid(interaction, calendar)
  }

  isDateSelectionValid(selection: DateSpan): boolean {
    let { calendar } = this.context
    let dateProfile = (this.props as any).dateProfile // HACK

    if (
      dateProfile && // HACK for MorePopover
      !rangeContainsRange(dateProfile.validRange, selection.range)
    ) {
      return false
    }

    return isDateSelectionValid(selection, calendar)
  }


  // Pointer Interaction Utils
  // -----------------------------------------------------------------------------------------------------------------

  isValidSegDownEl(el: HTMLElement) {
    return !(this.props as any).eventDrag && // HACK
      !(this.props as any).eventResize && // HACK
      !elementClosest(el, '.fc-event-mirror') &&
      (this.isPopover() || !this.isInPopover(el))
      // ^above line ensures we don't detect a seg interaction within a nested component.
      // it's a HACK because it only supports a popover as the nested component.
  }


  isValidDateDownEl(el: HTMLElement) {
    return !elementClosest(el, '.fc-event:not(.fc-bg-event)') &&
      !elementClosest(el, '.fc-daygrid-more-link') && // a "more.." link
      !elementClosest(el, 'a[data-navlink]') && // a clickable nav link
      !this.isInPopover(el)
  }


  isPopover() { // HACK. should be overridden by any components that know that they live within a popover
    return false
  }


  isInPopover(el: HTMLElement) {
    return Boolean(elementClosest(el, '.fc-popover'))
  }

}
