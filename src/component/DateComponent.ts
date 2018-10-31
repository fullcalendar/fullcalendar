import Component, { ComponentContext } from './Component'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore, expandRecurring } from '../structs/event-store'
import { EventUiHash, EventRenderRange, computeEventDefUis, sliceEventStore, computeEventDefUi, hasBgRendering } from './event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { createDuration, Duration } from '../datelib/duration'
import { parseEventDef, createEventInstance } from '../structs/event'
import { DateRange, rangeContainsRange } from '../datelib/date-range'
import { Hit } from '../interactions/HitDragging'
import browserContext from '../common/browser-context'
import { elementClosest, removeElement } from '../util/dom-manip'
import { isSelectionValid, isEventsValid } from '../validation'
import EventApi from '../api/EventApi'

export interface DateComponentProps {
  dateProfile: DateProfile | null
  businessHours: EventStore
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
}

export type DateComponentHash = { [uid: string]: DateComponent }

// NOTE: for fg-events, eventRange.range is NOT sliced,
// thus, we need isStart/isEnd
export interface Seg {
  component: DateComponent
  isStart: boolean
  isEnd: boolean
  eventRange?: EventRenderRange
  el?: HTMLElement
  [otherProp: string]: any
}

export default class DateComponent extends Component<DateComponentProps> {

  // self-config, overridable by subclasses. must set on prototype
  isInteractable: boolean
  useEventCenter: boolean // for dragging geometry
  doesDragMirror: boolean // for events that ORIGINATE from this component
  doesDragHighlight: boolean // for events that ORIGINATE from this component
  slicingType: 'timed' | 'all-day' | null
  fgSegSelector: string // lets eventRender produce elements without fc-event class
  bgSegSelector: string

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any

  eventRendererClass: any
  mirrorRendererClass: any
  fillRendererClass: any

  eventRenderer: any
  mirrorRenderer: any
  fillRenderer: any

  el: HTMLElement // passed in to constructor
  needHitsDepth: number = 0

  // derived from options
  nextDayThreshold: Duration


  constructor(context: ComponentContext, el: HTMLElement) {
    super(context)

    this.el = el
    this.nextDayThreshold = createDuration(this.opt('nextDayThreshold'))

    if (this.fillRendererClass) {
      this.fillRenderer = new this.fillRendererClass(this)
    }

    if (this.eventRendererClass) {
      this.eventRenderer = new this.eventRendererClass(this)
    }

    if (this.mirrorRendererClass && this.eventRenderer) {
      this.mirrorRenderer = new this.mirrorRendererClass(this)
    }

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

  render(props: DateComponentProps) {
    this.subrender('afterSkeletonRender', [], 'beforeSkeletonUnrender', true)
    let dateId = this.subrender('_renderDates', [ props.dateProfile ], '_unrenderDates', true)
    this.subrender('renderBusinessHours', [ props.businessHours, dateId ], 'unrenderBusinessHours', true)
    this.subrender('renderDateSelectionState', [ props.dateSelection, dateId ], 'unrenderDateSelectionState', true)
    let evId = this.subrender('renderEvents', [ props.eventStore, props.eventUis, dateId ], 'unrenderEvents', true)
    this.subrender('renderEventSelection', [ props.eventSelection, evId ], 'unrenderEventSelection', true)
    this.subrender('renderEventDragState', [ props.eventDrag, dateId ], 'unrenderEventDragState', true)
    this.subrender('renderEventResizeState', [ props.eventResize, dateId ], 'unrenderEventResizeState', true)
  }

  updateSize(viewHeight: number, isAuto: boolean, isResize: boolean) {
    let map = this.dirtySizeMethodNames

    if (isResize || map.has('afterSkeletonRender') || map.has('_renderDates') || map.has('renderEvents')) {
      // sort of the catch-all sizing
      // anything that might cause dimension changes
      this.updateBaseSize(viewHeight, isAuto, isResize)
      this.buildPositionCaches()
    }

    if (isResize || map.has('renderBusinessHours')) {
      this.computeBusinessHoursSize()
    }

    if (isResize || map.has('renderDateSelectionState') || map.has('renderEventDragState') || map.has('renderEventResizeState')) {
      this.computeHighlightSize()
      this.computeMirrorSize()
    }

    if (isResize || map.has('renderEvents')) {
      this.computeEventsSize()
    }

    if (isResize || map.has('renderBusinessHours')) {
      this.assignBusinessHoursSize()
    }

    if (isResize || map.has('renderDateSelectionState') || map.has('renderEventDragState') || map.has('renderEventResizeState')) {
      this.assignHighlightSize()
      this.assignMirrorSize()
    }

    if (isResize || map.has('renderEvents')) {
      this.assignEventsSize()
    }

    this.dirtySizeMethodNames = new Map()
  }

  updateBaseSize(viewHeight: number, isAuto: boolean, isResize: boolean) {
  }

  buildPositionCaches() {
  }


  // Skeleton
  // -----------------------------------------------------------------------------------------------------------------


  afterSkeletonRender() {
  }


  beforeSkeletonUnrender() {
  }


  // Date
  // -----------------------------------------------------------------------------------------------------------------

  _renderDates(dateProfile: DateProfile) {
    this.renderDates(dateProfile)
    this.afterDatesRender()
  }

  _unrenderDates() {
    this.beforeDatesUnrender()
    this.unrenderDates()
  }

  renderDates(dateProfile: DateProfile) {
  }

  unrenderDates() {
  }

  afterDatesRender() {
  }

  beforeDatesUnrender() {
  }


  // Business Hours
  // ---------------------------------------------------------------------------------------------------------------

  renderBusinessHours(businessHours: EventStore) {
    if (this.slicingType) { // can use eventStoreToRanges?
      let expandedStore = expandRecurring(businessHours, this.props.dateProfile.activeRange, this.calendar)

      this.renderBusinessHourRanges(
        this.eventStoreToRanges(
          expandedStore,
          computeEventDefUis(expandedStore.defs, {}, {})
        )
      )
    }
  }

  renderBusinessHourRanges(eventRanges: EventRenderRange[]) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('businessHours', this.eventRangesToSegs(eventRanges))
    }
  }

  // Unrenders previously-rendered business-hours
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

  renderDateSelectionState(selection: DateSpan) {
    if (selection) {
      this.renderDateSelection(selection)
    }
  }

  unrenderDateSelectionState(selection: DateSpan) {
    if (selection) {
      this.unrenderDateSelection()
    }
  }

  renderDateSelection(selection: DateSpan) {
    this.renderHighlightSegs(this.selectionToSegs(selection, false))
  }

  unrenderDateSelection() {
    this.unrenderHighlight()
  }


  // Events
  // -----------------------------------------------------------------------------------------------------------------

  renderEvents(eventStore: EventStore, eventUis: EventUiHash) {
    if (this.slicingType) { // can use eventStoreToRanges?
      this.renderEventRanges(
        this.eventStoreToRanges(eventStore, eventUis)
      )
    }
  }

  renderEventRanges(eventRanges: EventRenderRange[]) {
    if (this.eventRenderer || this.fillRenderer) {

      let bgRanges = []
      let fgRanges = []

      for (let eventRange of eventRanges) {
        if (hasBgRendering(eventRange.ui)) {
          bgRanges.push(eventRange)
        } else {
          fgRanges.push(eventRange)
        }
      }

      if (this.eventRenderer) {
        this.eventRenderer.renderSegs(
          this.eventRangesToSegs(fgRanges)
        )
      }

      if (this.fillRenderer) {
        bgRanges = this.filterBgEventRanges(bgRanges)
        this.fillRenderer.renderSegs('bgEvent', this.eventRangesToSegs(bgRanges))
      }
    }
  }

  filterBgEventRanges(bgEventRanges) {
    return bgEventRanges
  }

  unrenderEvents() {
    if (this.eventRenderer) {
      this.eventRenderer.unrender()
    }

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

  renderEventDragState(state: EventInteractionUiState) {
    if (state) {

      if (this.eventRenderer) {
        this.eventRenderer.hideByHash(state.affectedEvents.instances)
      }

      this.renderEventDrag(
        state.mutatedEvents,
        state.eventUis,
        state.isEvent,
        state.origSeg
      )
    }
  }

  unrenderEventDragState(state: EventInteractionUiState) {
    if (state) {

      if (this.eventRenderer) {
        this.eventRenderer.showByHash(state.affectedEvents.instances)
      }

      this.unrenderEventDrag()
    }
  }

  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`.
  renderEventDrag(eventStore: EventStore, eventUis: EventUiHash, isEvent: boolean, sourceSeg: Seg | null) {
    let segs = this.eventRangesToSegs(
      this.eventStoreToRanges(eventStore, eventUis)
    )

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
      this.renderHighlightSegs(segs)
    }
  }

  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderEventDrag() {
    this.unrenderHighlight()

    if (this.mirrorRenderer) {
      this.mirrorRenderer.unrender()
    }
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------

  renderEventResizeState(state: EventInteractionUiState) {
    if (state) {

      if (this.eventRenderer) {
        this.eventRenderer.hideByHash(state.affectedEvents.instances)
      }

      this.renderEventResize(
        state.mutatedEvents,
        state.eventUis,
        state.origSeg
      )
    }
  }

  unrenderEventResizeState(state: EventInteractionUiState) {
    if (state) {

      if (this.eventRenderer) {
        this.eventRenderer.showByHash(state.affectedEvents.instances)
      }

      this.unrenderEventResize()
    }
  }

  // Renders a visual indication of an event being resized.
  renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg: any) {
    // subclasses can implement
  }

  // Unrenders a visual indication of an event being resized.
  unrenderEventResize() {
    // subclasses can implement
  }


  // Highlight
  // ---------------------------------------------------------------------------------------------------------------

  // Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
  renderHighlightSegs(segs) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('highlight', segs)
    }
  }

  // Unrenders the emphasis on a date range
  unrenderHighlight() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('highlight')
    }
  }

  computeHighlightSize() {
    if (this.fillRenderer) {
      this.fillRenderer.computeSizes('highlight')
    }
  }

  assignHighlightSize() {
    if (this.fillRenderer) {
      this.fillRenderer.assignSizes('highlight')
    }
  }


  // Mirror
  // ---------------------------------------------------------------------------------------------------------------

  computeMirrorSize() {
    if (this.mirrorRenderer) {
      this.mirrorRenderer.computeSizes()
    }
  }

  assignMirrorSize() {
    if (this.mirrorRenderer) {
      this.mirrorRenderer.assignSizes()
    }
  }


  // Converting selection/eventRanges -> segs
  // ---------------------------------------------------------------------------------------------------------------

  eventStoreToRanges(eventStore: EventStore, eventUis: EventUiHash): EventRenderRange[] {
    return sliceEventStore(
      eventStore,
      eventUis,
      this.props.dateProfile.activeRange,
      this.slicingType === 'all-day' ? this.nextDayThreshold : null
    )
  }

  eventRangesToSegs(eventRenderRanges: EventRenderRange[]): Seg[] {
    let allSegs: Seg[] = []

    for (let eventRenderRange of eventRenderRanges) {
      let segs = this.rangeToSegs(eventRenderRange.range, eventRenderRange.def.allDay)

      for (let seg of segs) {
        seg.eventRange = eventRenderRange
        seg.isStart = seg.isStart && eventRenderRange.isStart
        seg.isEnd = seg.isEnd && eventRenderRange.isEnd

        allSegs.push(seg)
      }
    }

    return allSegs
  }

  selectionToSegs(selection: DateSpan, fabricateEvents: boolean): Seg[] {
    let segs = this.rangeToSegs(selection.range, selection.allDay)

    if (fabricateEvents) {

      // fabricate an eventRange. important for mirror
      // TODO: make a separate utility for this?
      let def = parseEventDef(
        { editable: false },
        '', // sourceId
        selection.allDay,
        true, // hasEnd
        this.calendar
      )
      let eventRange = {
        def,
        ui: computeEventDefUi(def, {}, {}),
        instance: createEventInstance(def.defId, selection.range),
        range: selection.range,
        isStart: true,
        isEnd: true
      }

      for (let seg of segs) {
        seg.eventRange = eventRange
      }
    }

    return segs
  }

  // must implement if want to use many of the rendering utils
  rangeToSegs(range: DateRange, allDay: boolean): Seg[] {
    return []
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
    let dateProfile = this.props.dateProfile
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
    let dateProfile = this.props.dateProfile

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
    return !this.props.eventDrag && !this.props.eventResize &&
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
DateComponent.prototype.slicingType = null
DateComponent.prototype.fgSegSelector = '.fc-event-container > *'
DateComponent.prototype.bgSegSelector = '.fc-bgevent'
