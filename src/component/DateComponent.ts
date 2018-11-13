import Component, { ComponentContext } from './Component'
import { EventStore } from '../structs/event-store'
import { EventRenderRange, hasBgRendering } from './event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInstanceHash } from '../structs/event'
import { rangeContainsRange } from '../datelib/date-range'
import { Hit } from '../interactions/HitDragging'
import browserContext from '../common/browser-context'
import { elementClosest, removeElement } from '../util/dom-manip'
import { isSelectionValid, isEventsValid } from '../validation'
import EventApi from '../api/EventApi'
import FgEventRenderer from './renderers/FgEventRenderer'
import FillRenderer from './renderers/FillRenderer'

export type DateComponentHash = { [uid: string]: DateComponent<any> }

// NOTE: for fg-events, eventRange.range is NOT sliced,
// thus, we need isStart/isEnd
export interface Seg {
  component: DateComponent<any>
  isStart: boolean
  isEnd: boolean
  eventRange?: EventRenderRange
  el?: HTMLElement
  [otherProp: string]: any
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
  doesDragMirror: boolean // for events that ORIGINATE from this component
  doesDragHighlight: boolean // for events that ORIGINATE from this component
  fgSegSelector: string // lets eventRender produce elements without fc-event class
  bgSegSelector: string

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any

  eventRenderer: FgEventRenderer
  mirrorRenderer: FgEventRenderer
  fillRenderer: FillRenderer

  el: HTMLElement // passed in to constructor
  needHitsDepth: number = 0


  constructor(context: ComponentContext, el: HTMLElement) {
    super(context)

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


  // Business Hours
  // ---------------------------------------------------------------------------------------------------------------

  renderBusinessHourSegs(segs: Seg[]) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('businessHours', segs)
    }
  }

  unrenderBusinessHours() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('businessHours')
    }
  }

  computeBusinessHoursSize() {
    if (this.fillRenderer) {
      this.fillRenderer.computeSizes('businessHours')
    }
  }

  assignBusinessHoursSize() {
    if (this.fillRenderer) {
      this.fillRenderer.assignSizes('businessHours')
    }
  }


  // Date Selection
  // ---------------------------------------------------------------------------------------------------------------

  renderDateSelectionSegs(segs: Seg[]) {
    if (segs) {
      if (this.fillRenderer) {
        this.fillRenderer.renderSegs('highlight', segs)
      }
    }
  }

  unrenderDateSelection() {
    if (this.mirrorRenderer) {
      this.mirrorRenderer.unrender()
    }

    if (this.fillRenderer) {
      this.fillRenderer.unrender('highlight')
    }
  }


  // Events
  // -----------------------------------------------------------------------------------------------------------------

  renderEventSegs(segs: Seg[]) {
    let bgSegs = []
    let fgSegs = []

    for (let seg of segs) {
      if (hasBgRendering(seg.eventRange.ui)) {
        bgSegs.push(seg)
      } else {
        fgSegs.push(seg)
      }
    }

    this.renderFgEventSegs(fgSegs)
    this.renderBgEventSegs(bgSegs)
  }

  renderFgEventSegs(segs: Seg[]) {
    if (this.eventRenderer) {
      this.eventRenderer.renderSegs(segs)
    }
  }

  renderBgEventSegs(segs: Seg[]) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('bgEvent', segs)
    }
  }

  unrenderEvents() {
    this.unrenderFgEventSegs()
    this.unrenderBgEventSegs()
  }

  unrenderFgEventSegs() {
    if (this.eventRenderer) {
      this.eventRenderer.unrender()
    }
  }

  unrenderBgEventSegs() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('bgEvent')
    }
  }

  computeEventsSize() {
    if (this.fillRenderer) {
      this.fillRenderer.computeSizes('bgEvent')
    }

    if (this.eventRenderer) {
      this.eventRenderer.computeSizes()
    }
  }

  assignEventsSize() {
    if (this.fillRenderer) {
      this.fillRenderer.assignSizes('bgEvent')
    }

    if (this.eventRenderer) {
      this.eventRenderer.assignSizes()
    }
  }


  // Event Instance Selection (aka long-touch focus)
  // -----------------------------------------------------------------------------------------------------------------
  // TODO: show/hide according to groupId?

  renderEventSelection(instanceId) {
    if (instanceId && this.eventRenderer) {
      this.eventRenderer.selectByInstanceId(instanceId)
    }
  }

  unrenderEventSelection(instanceId) {
    if (instanceId && this.eventRenderer) {
      this.eventRenderer.unselectByInstanceId(instanceId)
    }
  }


  // Event Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------

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

  unrenderEventDragSegs(state: EventSegUiInteractionState) {
    if (state) {
      this.unrenderEventDrag(state.affectedInstances)
    }
  }

  unrenderEventDrag(affectedInstances: EventInstanceHash) {
    if (this.eventRenderer) {
      this.eventRenderer.showByHash(affectedInstances)
    }

    if (this.mirrorRenderer) {
      this.mirrorRenderer.unrender()
    }

    if (this.fillRenderer) {
      this.fillRenderer.unrender('highlight')
    }
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------

  renderEventResizeSegs(state: EventSegUiInteractionState) {
    if (this.eventRenderer) {
      this.eventRenderer.hideByHash(state.affectedInstances)
    }

    // subclasses can override and do something with segs
  }

  unrenderEventResizeSegs(state: EventSegUiInteractionState) {
    if (state) {
      this.unrenderEventResize(state.affectedInstances)
    }
  }

  unrenderEventResize(affectedInstances: EventInstanceHash) {
    if (this.eventRenderer) {
      this.eventRenderer.showByHash(affectedInstances)
    }

    if (this.mirrorRenderer) {
      this.mirrorRenderer.unrender()
    }

    if (this.fillRenderer) {
      this.fillRenderer.unrender('highlight')
    }
  }


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

  isEventsValid(eventStore: EventStore) {
    let dateProfile = (this.props as any).dateProfile // HACK
    let instances = eventStore.instances

    if (dateProfile) { // HACK for DayTile
      for (let instanceId in instances) {
        if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
          return false
        }
      }
    }

    return isEventsValid(eventStore, this.calendar)
  }

  isSelectionValid(selection: DateSpan): boolean {
    let dateProfile = (this.props as any).dateProfile // HACK

    if (
      dateProfile && // HACK for DayTile
      !rangeContainsRange(dateProfile.validRange, selection.range)
    ) {
      return false
    }

    return isSelectionValid(selection, this.calendar)
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
DateComponent.prototype.doesDragMirror = false
DateComponent.prototype.doesDragHighlight = false
DateComponent.prototype.fgSegSelector = '.fc-event-container > *'
DateComponent.prototype.bgSegSelector = '.fc-bgevent'
