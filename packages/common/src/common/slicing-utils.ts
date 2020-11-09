import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Seg, EventSegUiInteractionState } from '../component/DateComponent' // TODO: rename EventSegUiInteractionState, move here
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { Duration } from '../datelib/duration'
import { memoize } from '../util/memoize'
import { DateMarker, addMs, addDays } from '../datelib/marker'
import { CalendarContext } from '../CalendarContext'
import { expandRecurring } from '../structs/recurring-event'

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

export abstract class Slicer<SegType extends Seg, ExtraArgs extends any[] = []> {
  private sliceBusinessHours = memoize(this._sliceBusinessHours)
  private sliceDateSelection = memoize(this._sliceDateSpan)
  private sliceEventStore = memoize(this._sliceEventStore)
  private sliceEventDrag = memoize(this._sliceInteraction)
  private sliceEventResize = memoize(this._sliceInteraction)

  abstract sliceRange(dateRange: DateRange, ...extraArgs: ExtraArgs): SegType[]
  protected forceDayIfListItem = false // hack

  sliceProps(
    props: SliceableProps,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): SlicedProps<SegType> {
    let { eventUiBases } = props
    let eventSegs = this.sliceEventStore(props.eventStore, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs)

    return {
      dateSelectionSegs: this.sliceDateSelection(props.dateSelection, eventUiBases, context, ...extraArgs),
      businessHourSegs: this.sliceBusinessHours(props.businessHours, dateProfile, nextDayThreshold, context, ...extraArgs),
      fgEventSegs: eventSegs.fg,
      bgEventSegs: eventSegs.bg,
      eventDrag: this.sliceEventDrag(props.eventDrag, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs),
      eventResize: this.sliceEventResize(props.eventResize, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs),
      eventSelection: props.eventSelection,
    } // TODO: give interactionSegs?
  }

  sliceNowDate( // does not memoize
    date: DateMarker,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): SegType[] {
    return this._sliceDateSpan(
      { range: { start: date, end: addMs(date, 1) }, allDay: false }, // add 1 ms, protect against null range
      {},
      context,
      ...extraArgs,
    )
  }

  private _sliceBusinessHours(
    businessHours: EventStore,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): SegType[] {
    if (!businessHours) {
      return []
    }

    return this._sliceEventStore(
      expandRecurring(
        businessHours,
        computeActiveRange(dateProfile, Boolean(nextDayThreshold)),
        context,
      ),
      {},
      dateProfile,
      nextDayThreshold,
      ...extraArgs,
    ).bg
  }

  private _sliceEventStore(
    eventStore: EventStore,
    eventUiBases: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    ...extraArgs: ExtraArgs
  ): { bg: SegType[], fg: SegType[] } {
    if (eventStore) {
      let rangeRes = sliceEventStore(
        eventStore,
        eventUiBases,
        computeActiveRange(dateProfile, Boolean(nextDayThreshold)),
        nextDayThreshold,
      )

      return {
        bg: this.sliceEventRanges(rangeRes.bg, extraArgs),
        fg: this.sliceEventRanges(rangeRes.fg, extraArgs),
      }
    }
    return { bg: [], fg: [] }
  }

  private _sliceInteraction(
    interaction: EventInteractionState,
    eventUiBases: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    ...extraArgs: ExtraArgs
  ): EventSegUiInteractionState {
    if (!interaction) {
      return null
    }

    let rangeRes = sliceEventStore(
      interaction.mutatedEvents,
      eventUiBases,
      computeActiveRange(dateProfile, Boolean(nextDayThreshold)),
      nextDayThreshold,
    )

    return {
      segs: this.sliceEventRanges(rangeRes.fg, extraArgs),
      affectedInstances: interaction.affectedEvents.instances,
      isEvent: interaction.isEvent,
    }
  }

  private _sliceDateSpan(
    dateSpan: DateSpan,
    eventUiBases: EventUiHash,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): SegType[] {
    if (!dateSpan) {
      return []
    }

    let eventRange = fabricateEventRange(dateSpan, eventUiBases, context)
    let segs = this.sliceRange(dateSpan.range, ...extraArgs)

    for (let seg of segs) {
      seg.eventRange = eventRange
    }

    return segs
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private sliceEventRanges(
    eventRanges: EventRenderRange[],
    extraArgs: ExtraArgs,
  ): SegType[] {
    let segs: SegType[] = []

    for (let eventRange of eventRanges) {
      segs.push(...this.sliceEventRange(eventRange, extraArgs))
    }

    return segs
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private sliceEventRange(
    eventRange: EventRenderRange,
    extraArgs: ExtraArgs,
  ): SegType[] {
    let dateRange = eventRange.range

    // hack to make multi-day events that are being force-displayed as list-items to take up only one day
    if (this.forceDayIfListItem && eventRange.ui.display === 'list-item') {
      dateRange = {
        start: dateRange.start,
        end: addDays(dateRange.start, 1),
      }
    }

    let segs = this.sliceRange(dateRange, ...extraArgs)

    for (let seg of segs) {
      seg.eventRange = eventRange
      seg.isStart = eventRange.isStart && seg.isStart
      seg.isEnd = eventRange.isEnd && seg.isEnd
    }

    return segs
  }
}

/*
for incorporating slotMinTime/slotMaxTime if appropriate
TODO: should be part of DateProfile!
TimelineDateProfile already does this btw
*/
function computeActiveRange(dateProfile: DateProfile, isComponentAllDay: boolean): DateRange {
  let range = dateProfile.activeRange

  if (isComponentAllDay) {
    return range
  }

  return {
    start: addMs(range.start, dateProfile.slotMinTime.milliseconds),
    end: addMs(range.end, dateProfile.slotMaxTime.milliseconds - 864e5), // 864e5 = ms in a day
  }
}
