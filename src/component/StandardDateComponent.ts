import DateComponent, { Seg } from './DateComponent'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore, expandRecurring } from '../structs/event-store'
import { EventUiHash, computeEventDefUis, EventRenderRange, hasBgRendering, computeEventDefUi, sliceEventStore } from './event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { Duration, createDuration } from '../datelib/duration'
import { ComponentContext } from './Component';
import { parseEventDef, createEventInstance } from '../structs/event'
import { DateRange } from '../datelib/date-range'

export interface StandardDateComponentProps {
  dateProfile: DateProfile | null
  businessHours: EventStore
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
}

/*
PURPOSES:
- accepts a common form of props
- slices prop data into segs, for StandardDateComponent's renderers
*/
export default class StandardDateComponent extends DateComponent<StandardDateComponentProps> {

  slicingType: 'timed' | 'all-day' | null = null

  // derived from options
  nextDayThreshold: Duration


  constructor(context: ComponentContext, el: HTMLElement) {
    super(context, el)

    this.nextDayThreshold = createDuration(this.opt('nextDayThreshold'))
  }


  // SHOULD BE ABSTRACT
  // but Views extends from this class :(
  rangeToSegs(range: DateRange, allDay: boolean): Seg[] {
    return []
  }


  render(props: StandardDateComponentProps) {
    this.subrender('afterSkeletonRender', [], 'beforeSkeletonUnrender', true)
    let dateId = this.subrender('_renderDates', [ props.dateProfile ], '_unrenderDates', true)
    this.subrender('renderBusinessHours', [ props.businessHours, props.dateProfile, dateId ], 'unrenderBusinessHours', true)
    this.subrender('renderDateSelectionState', [ props.dateSelection, dateId ], 'unrenderDateSelectionState', true)
    let evId = this.subrender('renderEvents', [ props.eventStore, props.eventUis, dateId ], 'unrenderEvents', true)
    this.subrender('renderEventSelection', [ props.eventSelection, evId ], 'unrenderEventSelection', true)
    this.subrender('renderEventDragState', [ props.eventDrag, dateId ], 'unrenderEventDragState', true)
    this.subrender('renderEventResizeState', [ props.eventResize, dateId ], 'unrenderEventResizeState', true)
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------

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
      if (this.mirrorRenderer) {
        this.mirrorRenderer.computeSizes()
      }
      if (this.fillRenderer) {
        this.fillRenderer.computeSizes('highlight')
      }
    }

    if (isResize || map.has('renderEvents')) {
      this.computeEventsSize()
    }

    if (isResize || map.has('renderBusinessHours')) {
      this.assignBusinessHoursSize()
    }

    if (isResize || map.has('renderDateSelectionState') || map.has('renderEventDragState') || map.has('renderEventResizeState')) {
      if (this.mirrorRenderer) {
        this.mirrorRenderer.assignSizes()
      }
      if (this.fillRenderer) {
        this.fillRenderer.assignSizes('highlight')
      }
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

  renderBusinessHours(businessHours: EventStore, dateProfile: DateProfile) {
    let expandedStore = expandRecurring(businessHours, dateProfile.activeRange, this.calendar)

    this.renderBusinessHourRanges(
      this.eventStoreToRanges(
        expandedStore,
        computeEventDefUis(expandedStore.defs, {}, {})
      )
    )
  }

  renderBusinessHourRanges(eventRanges: EventRenderRange[]) {
    this.renderBusinessHourSegs(this.eventRangesToSegs(eventRanges))
  }


  // Date Selection
  // ---------------------------------------------------------------------------------------------------------------

  renderDateSelectionState(selection: DateSpan | null) {
    if (selection) {
      this.renderDateSelection(selection)
    }
  }

  unrenderDateSelectionState(selection: DateSpan | null) {
    if (selection) {
      this.unrenderDateSelection(selection)
    }
  }

  renderDateSelection(selection: DateSpan) {
    this.renderDateSelectionSegs(this.selectionToSegs(selection))
  }


  // Events
  // -----------------------------------------------------------------------------------------------------------------

  renderEvents(eventStore: EventStore, eventUis: EventUiHash) {
    this.renderEventRanges(
      this.eventStoreToRanges(eventStore, eventUis)
    )
  }

  renderEventRanges(eventRanges: EventRenderRange[]) {
    let bgRanges = []
    let fgRanges = []

    for (let eventRange of eventRanges) {
      if (hasBgRendering(eventRange.ui)) {
        bgRanges.push(eventRange)
      } else {
        fgRanges.push(eventRange)
      }
    }

    this.renderFgEventSegs(
      this.eventRangesToSegs(fgRanges)
    )

    this.renderBgEventSegs(
      this.eventRangesToSegs(bgRanges)
    )
  }


  // Event Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------

  renderEventDragState(state: EventInteractionUiState | null) {
    if (state) {
      this.renderEventDrag(state)
    }
  }

  unrenderEventDragState(state: EventInteractionUiState | null) {
    if (state) {
      this.unrenderEventDrag(state)
    }
  }

  renderEventDrag(state: EventInteractionUiState) {
    let segs = this.eventRangesToSegs(
      this.eventStoreToRanges(state.mutatedEvents, state.eventUis)
    )

    this.renderEventDragSegs(segs, state.isEvent, state.origSeg, state.affectedEvents.instances)
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------

  renderEventResizeState(state: EventInteractionUiState | null) {
    if (state) {
      this.renderEventResize(state)
    }
  }

  unrenderEventResizeState(state: EventInteractionUiState | null) {
    if (state) {
      this.unrenderEventResize(state)
    }
  }

  renderEventResize(state: EventInteractionUiState) {
    let segs = this.eventRangesToSegs(
      this.eventStoreToRanges(state.mutatedEvents, state.eventUis)
    )

    this.renderEventResizeSegs(segs, state.origSeg, state.affectedEvents.instances)
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

  selectionToSegs(selection: DateSpan): Seg[] {
    let segs = this.rangeToSegs(selection.range, selection.allDay)

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

    return segs
  }

}
