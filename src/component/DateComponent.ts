import Component, { ComponentContext } from './Component'
import { EventRenderRange } from './event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInstanceHash } from '../structs/event'
import { rangeContainsRange } from '../datelib/date-range'
import { Hit } from '../interactions/HitDragging'
import browserContext from '../common/browser-context'
import { elementClosest, removeElement } from '../util/dom-manip'
import { isDateSelectionValid, isInteractionValid } from '../validation'
import EventApi from '../api/EventApi'
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
  isInteractable: boolean
  useEventCenter: boolean // for dragging geometry
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
  needHitsDepth: number = 0


  constructor(context: ComponentContext, el: HTMLElement, isView?: boolean) {
    super(context, isView)

    this.el = el

    if (this.isInteractable) {
      browserContext.registerComponent(this)
    }
  }

  destroy() {
    super.destroy()

    removeElement(this.el)

    if (this.isInteractable) {
      browserContext.unregisterComponent(this)
    }
  }


  // TODO: WHAT ABOUT (sourceSeg && sourceSeg.component.doesDragMirror)
  //
  // Event Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------
  /*
  renderEventDragSegs(state: EventSegUiInteractionState) {
    if (state) {
      let { isEvent, segs, sourceSeg } = state

      if (this.eventRenderer) {
        this.eventRenderer.hideByHash(state.affectedInstances)
      }

      // if the user is dragging something that is considered an event with real event data,
      // and this component likes to do drag mirrors OR the component where the seg came from
      // likes to do drag mirrors, then render a drag mirror.
      if (isEvent && (this.doesDragMirror || sourceSeg && sourceSeg.component.doesDragMirror)) {
        if (this.mirrorRenderer) {
          this.mirrorRenderer.renderSegs(segs, { isDragging: true, sourceSeg })
        }
      }

      // if it would be impossible to render a drag mirror OR this component likes to render
      // highlights, then render a highlight.
      if (!isEvent || this.doesDragHighlight) {
        if (this.fillRenderer) {
          this.fillRenderer.renderSegs('highlight', segs)
        }
      }
    }
  }
  */


  // Hit System
  // -----------------------------------------------------------------------------------------------------------------

  requestPrepareHits() {
    if (!(this.needHitsDepth++)) {
      this.prepareHits()
    }
  }

  requestReleaseHits() {
    if (!(--this.needHitsDepth)) {
      this.releaseHits()
    }
  }

  protected prepareHits() {
  }

  protected releaseHits() {
  }

  queryHit(leftOffset, topOffset): Hit | null {
    return null // this should be abstract
  }


  // Validation
  // -----------------------------------------------------------------------------------------------------------------

  isInteractionValid(interaction: EventInteractionState) {
    let { calendar } = this
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
    let dateProfile = (this.props as any).dateProfile // HACK

    if (
      dateProfile && // HACK for DayTile
      !rangeContainsRange(dateProfile.validRange, selection.range)
    ) {
      return false
    }

    return isDateSelectionValid(selection, this.calendar)
  }


  // Triggering
  // -----------------------------------------------------------------------------------------------------------------
  // TODO: move to Calendar


  publiclyTrigger(name, args) {
    let calendar = this.calendar

    return calendar.publiclyTrigger(name, args)
  }


  publiclyTriggerAfterSizing(name, args) {
    let calendar = this.calendar

    return calendar.publiclyTriggerAfterSizing(name, args)
  }


  hasPublicHandlers(name) {
    let calendar = this.calendar

    return calendar.hasPublicHandlers(name)
  }


  triggerRenderedSegs(segs: Seg[], isMirrors: boolean) {
    let { calendar } = this

    if (this.hasPublicHandlers('eventPositioned')) {

      for (let seg of segs) {
        this.publiclyTriggerAfterSizing('eventPositioned', [
          {
            event: new EventApi(
              calendar,
              seg.eventRange.def,
              seg.eventRange.instance
            ),
            isMirror: isMirrors,
            isStart: seg.isStart,
            isEnd: seg.isEnd,
            el: seg.el,
            view: this // ?
          }
        ])
      }
    }

    if (!calendar.state.loadingLevel) { // avoid initial empty state while pending
      calendar.afterSizingTriggers._eventsPositioned = [ null ] // fire once
    }
  }

  triggerWillRemoveSegs(segs: Seg[]) {
    let { calendar } = this

    for (let seg of segs) {
      calendar.trigger('eventElRemove', seg.el)
    }

    if (this.hasPublicHandlers('eventDestroy')) {

      for (let seg of segs) {
        this.publiclyTrigger('eventDestroy', [
          {
            event: new EventApi(
              calendar,
              seg.eventRange.def,
              seg.eventRange.instance
            ),
            el: seg.el,
            view: this // ?
          }
        ])
      }
    }
  }


  // Pointer Interaction Utils
  // -----------------------------------------------------------------------------------------------------------------

  isValidSegDownEl(el: HTMLElement) {
    return !(this.props as any).eventDrag && // HACK
      !(this.props as any).eventResize && // HACK
      !elementClosest(el, '.fc-mirror') &&
      !this.isInPopover(el) // how to determine if not in a sub-component???
  }


  isValidDateDownEl(el: HTMLElement) {
    let segEl = elementClosest(el, this.fgSegSelector)

    return (!segEl || segEl.classList.contains('fc-mirror')) &&
      !elementClosest(el, '.fc-more') && // a "more.." link
      !elementClosest(el, 'a[data-goto]') && // a clickable nav link
      !this.isInPopover(el)
  }


  // is the element inside of an inner popover?
  isInPopover(el: HTMLElement) {
    let popoverEl = elementClosest(el, '.fc-popover')
    return popoverEl && popoverEl !== this.el // if the current component IS a popover, okay
  }

}

DateComponent.prototype.isInteractable = false
DateComponent.prototype.useEventCenter = true
DateComponent.prototype.fgSegSelector = '.fc-event-container > *'
DateComponent.prototype.bgSegSelector = '.fc-bgevent:not(.fc-nonbusiness)'
