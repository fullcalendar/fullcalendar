import { DateRange } from '../datelib/date-range'
import { EventStore, expandRecurring } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Seg, EventSegUiInteractionState } from '../component/DateComponent' // TODO: rename EventSegUiInteractionState, move here
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import DateComponent from '../component/DateComponent'
import { Duration } from '../datelib/duration'
import reselector from '../util/reselector'
import { DateMarker, addMs } from '../datelib/marker'

export interface SliceableProps {
  dateSelection: DateSpan
  businessHours: EventStore
  eventStore: EventStore
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  eventSelection: string
  eventUiBases: EventUiHash
}

export interface SlicedProps<SegType extends Seg> {
  dateSelectionSegs: SegType[]
  businessHourSegs: SegType[]
  fgEventSegs: SegType[]
  bgEventSegs: SegType[]
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  eventSelection: string
}

export default abstract class Slicer<SegType extends Seg, ExtraArgs extends any[] = []> {

  private sliceBusinessHours = reselector(this._sliceBusinessHours)
  private sliceDateSelection = reselector(this._sliceDateSpan)
  private sliceEventStore = reselector(this._sliceEventStore)
  private sliceEventDrag = reselector(this._sliceInteraction)
  private sliceEventResize = reselector(this._sliceInteraction)

  abstract sliceRange(dateRange: DateRange, ...extraArgs: ExtraArgs): SegType[]

  sliceProps(
    props: SliceableProps,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): SlicedProps<SegType> {
    let { eventUiBases } = props
    let eventSegs = this.sliceEventStore(props.eventStore, eventUiBases, dateProfile, nextDayThreshold, component, ...extraArgs)

    return {
      dateSelectionSegs: this.sliceDateSelection(props.dateSelection, eventUiBases, component, ...extraArgs),
      businessHourSegs: this.sliceBusinessHours(props.businessHours, dateProfile, nextDayThreshold, component, ...extraArgs),
      fgEventSegs: eventSegs.fg,
      bgEventSegs: eventSegs.bg,
      eventDrag: this.sliceEventDrag(props.eventDrag, eventUiBases, dateProfile, nextDayThreshold, component, ...extraArgs),
      eventResize: this.sliceEventResize(props.eventResize, eventUiBases, dateProfile, nextDayThreshold, component, ...extraArgs),
      eventSelection: props.eventSelection
    }
  }

  sliceNowDate( // does not memoize
    date: DateMarker,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): SegType[] {
    return this._sliceDateSpan(
      { range: { start: date, end: addMs(date, 1) }, allDay: false }, // add 1 ms, protect against null range
      {},
      component,
      ...extraArgs
    )
  }

  private _sliceBusinessHours(
    businessHours: EventStore,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): SegType[] {
    if (!businessHours) {
      return []
    }

    return this._sliceEventStore(
      expandRecurring(businessHours, dateProfile.activeRange, component.calendar),
      {},
      dateProfile,
      nextDayThreshold,
      component,
      ...extraArgs
    ).bg
  }

  private _sliceEventStore(
    eventStore: EventStore,
    eventUiBases: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): { bg: SegType[], fg: SegType[] } {
    if (eventStore) {
      let rangeRes = sliceEventStore(eventStore, eventUiBases, dateProfile.activeRange, nextDayThreshold)

      return {
        bg: this.sliceEventRanges(rangeRes.bg, component, extraArgs),
        fg: this.sliceEventRanges(rangeRes.fg, component, extraArgs)
      }

    } else {
      return { bg: [], fg: [] }
    }
  }

  private _sliceInteraction(
    interaction: EventInteractionState,
    eventUiBases: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): EventSegUiInteractionState {
    if (!interaction) {
      return null
    }

    let rangeRes = sliceEventStore(interaction.mutatedEvents, eventUiBases, dateProfile.activeRange, nextDayThreshold)

    return {
      segs: this.sliceEventRanges(rangeRes.fg, component, extraArgs),
      affectedInstances: interaction.affectedEvents.instances,
      isEvent: interaction.isEvent,
      sourceSeg: interaction.origSeg
    }
  }

  private _sliceDateSpan(
    dateSpan: DateSpan,
    eventUiBases: EventUiHash,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): SegType[] {
    if (!dateSpan) {
      return []
    }

    let eventRange = fabricateEventRange(dateSpan, eventUiBases, component.calendar)
    let segs = this.sliceRange(dateSpan.range, ...extraArgs)

    for (let seg of segs) {
      seg.component = component
      seg.eventRange = eventRange
    }

    return segs
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private sliceEventRanges(
    eventRanges: EventRenderRange[],
    component: DateComponent<any>, // TODO: kill
    extraArgs: ExtraArgs
  ): SegType[] {
    let segs: SegType[] = []

    for (let eventRange of eventRanges) {
      segs.push(...this.sliceEventRange(eventRange, component, extraArgs))
    }

    return segs
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private sliceEventRange(
    eventRange: EventRenderRange,
    component: DateComponent<any>, // TODO: kill
    extraArgs: ExtraArgs
  ): SegType[] {
    let segs = this.sliceRange(eventRange.range, ...extraArgs)

    for (let seg of segs) {
      seg.component = component
      seg.eventRange = eventRange
      seg.isStart = eventRange.isStart && seg.isStart
      seg.isEnd = eventRange.isEnd && seg.isEnd
    }

    return segs
  }

}
