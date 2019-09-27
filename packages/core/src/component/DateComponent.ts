import Component from './Component'
import { EventRenderRange } from './event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInstanceHash } from '../structs/event'
import { rangeContainsRange } from '../datelib/date-range'
import { Hit } from '../interactions/hit'
import { elementClosest, removeElement } from '../util/dom-manip'
import { isDateSelectionValid, isInteractionValid } from '../validation'
import FgEventRenderer from './renderers/FgEventRenderer'
import FillRenderer from './renderers/FillRenderer'
import { EventInteractionState } from '../interactions/event-interaction-state'

export type DateComponentHash = { [uid: string]: DateComponent<any> }

// NOTE: for fg-events, eventRange.range is NOT sliced,
// thus, we need isStart/isEnd
export interface Seg {
  component?: DateComponent<any>
  isStart: boolean
  isEnd: boolean
  eventRange?: EventRenderRange
  el?: HTMLElement
  [otherProp: string]: any // TODO: remove this. extending Seg will handle this
}

export interface EventSegUiInteractionState {
  affectedInstances: EventInstanceHash
  segs: Seg[]
  isEvent: boolean
  sourceSeg: any
}

/*
PURPOSES:
- hook up to fg, fill, and mirror renderers
- interface for dragging and hits
*/
export default class DateComponent<PropsType> extends Component<PropsType> {

  // self-config, overridable by subclasses. must set on prototype
  fgSegSelector: string // lets eventRender produce elements without fc-event class
  bgSegSelector: string
  // IN SCHEDULER: allowAcrossResources

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any

  eventRenderer: FgEventRenderer
  mirrorRenderer: FgEventRenderer
  fillRenderer: FillRenderer

  el: HTMLElement // passed in to constructor


  constructor(el: HTMLElement) {
    super()

    this.el = el
  }

  destroy() {
    super.destroy()

    removeElement(this.el)
  }


  // Hit System
  // -----------------------------------------------------------------------------------------------------------------


  buildPositionCaches() {
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

    if (dateProfile) { // HACK for DayTile
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
      dateProfile && // HACK for DayTile
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
      !elementClosest(el, '.fc-mirror') &&
      (this.isPopover() || !this.isInPopover(el))
      // ^above line ensures we don't detect a seg interaction within a nested component.
      // it's a HACK because it only supports a popover as the nested component.
  }


  isValidDateDownEl(el: HTMLElement) {
    let segEl = elementClosest(el, this.fgSegSelector)

    return (!segEl || segEl.classList.contains('fc-mirror')) &&
      !elementClosest(el, '.fc-more') && // a "more.." link
      !elementClosest(el, 'a[data-goto]') && // a clickable nav link
      !this.isInPopover(el)
  }


  isPopover() {
    return this.el.classList.contains('fc-popover')
  }


  isInPopover(el: HTMLElement) {
    return Boolean(elementClosest(el, '.fc-popover'))
  }

}

DateComponent.prototype.fgSegSelector = '.fc-event-container > *'
DateComponent.prototype.bgSegSelector = '.fc-bgevent:not(.fc-nonbusiness)'
