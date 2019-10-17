import { DateRange } from '../datelib/date-range'
import { EventStore, expandRecurring } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import DateComponent, { Seg, EventSegUiInteractionState } from '../component/DateComponent' // TODO: rename EventSegUiInteractionState, move here
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { Duration } from '../datelib/duration'
import { memoize } from '../util/memoize'
import { DateMarker, addMs } from '../datelib/marker'
import Calendar from '../Calendar'

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

  private sliceBusinessHours = memoize(this._sliceBusinessHours)
  private sliceDateSelection = memoize(this._sliceDateSpan)
  private sliceEventStore = memoize(this._sliceEventStore)
  private sliceEventDrag = memoize(this._sliceInteraction)
  private sliceEventResize = memoize(this._sliceInteraction)

  abstract sliceRange(dateRange: DateRange, ...extraArgs: ExtraArgs): SegType[]

  sliceProps(
    props: SliceableProps,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    calendar: Calendar,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): SlicedProps<SegType> {
    let { eventUiBases } = props
    let eventSegs = this.sliceEventStore(props.eventStore, eventUiBases, dateProfile, nextDayThreshold, component, ...extraArgs)

    return {
      dateSelectionSegs: this.sliceDateSelection(props.dateSelection, eventUiBases, component, ...extraArgs),
      businessHourSegs: this.sliceBusinessHours(props.businessHours, dateProfile, nextDayThreshold, calendar, component, ...extraArgs),
      fgEventSegs: eventSegs.fg,
      bgEventSegs: eventSegs.bg,
      eventDrag: this.sliceEventDrag(props.eventDrag, eventUiBases, dateProfile, nextDayThreshold, component, ...extraArgs),
      eventResize: this.sliceEventResize(props.eventResize, eventUiBases, dateProfile, nextDayThreshold, component, ...extraArgs),
      eventSelection: props.eventSelection
    } // TODO: give interactionSegs?
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
    nextDayThreshold: Duration | null,
    calendar: Calendar,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): SegType[] {
    if (!businessHours) {
      return []
    }

    return this._sliceEventStore(
      expandRecurring(
        businessHours,
        computeActiveRange(dateProfile, Boolean(nextDayThreshold)),
        calendar
      ),
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
    nextDayThreshold: Duration | null,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): { bg: SegType[], fg: SegType[] } {
    if (eventStore) {
      let rangeRes = sliceEventStore(
        eventStore,
        eventUiBases,
        computeActiveRange(dateProfile, Boolean(nextDayThreshold)),
        nextDayThreshold
      )

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
    nextDayThreshold: Duration | null,
    component: DateComponent<any>, // TODO: kill
    ...extraArgs: ExtraArgs
  ): EventSegUiInteractionState {
    if (!interaction) {
      return null
    }

    let rangeRes = sliceEventStore(
      interaction.mutatedEvents,
      eventUiBases,
      computeActiveRange(dateProfile, Boolean(nextDayThreshold)),
      nextDayThreshold
    )

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

    let eventRange = fabricateEventRange(dateSpan, eventUiBases, component.context.calendar)
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

/*
for incorporating minTime/maxTime if appropriate
TODO: should be part of DateProfile!
TimelineDateProfile already does this btw
*/
function computeActiveRange(dateProfile: DateProfile, isComponentAllDay: boolean): DateRange {
  let range = dateProfile.activeRange

  if (isComponentAllDay) {
    return range
  }

  return {
    start: addMs(range.start, dateProfile.minTime.milliseconds),
    end: addMs(range.end, dateProfile.maxTime.milliseconds - 864e5) // 864e5 = ms in a day
  }
}
