import { DateRange, intersectRanges, Duration, DateMarker, addMs, addDays } from '@full-ui/headless-calendar'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component-util/event-ui'
import { sliceEventStore, EventRenderRange, EventRangeProps } from '../component-util/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { EventSegUiInteractionState } from '../component/DateComponent' // TODO: rename EventSegUiInteractionState, move here
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { memoize } from '../util/memoize'
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

export interface SlicedProps<R> {
  fgEventSegs: (R & EventRangeProps)[]
  bgEventSegs: (R & EventRangeProps)[]
  businessHourSegs: (R & EventRangeProps)[]
  dateSelectionSegs: (R & EventRangeProps)[]
  eventDrag: EventSegUiInteractionState<R> | null
  eventResize: EventSegUiInteractionState<R> | null
  eventSelection: string
}

export abstract class Slicer<R, ExtraArgs extends any[] = []> {
  private sliceBusinessHours = memoize(this._sliceBusinessHours)
  private sliceDateSelection = memoize(this._sliceDateSpan)
  private sliceEventStore = memoize(this._sliceEventStore)
  private sliceEventDrag = memoize(this._sliceInteraction)
  private sliceEventResize = memoize(this._sliceInteraction)

  abstract sliceRange(dateRange: DateRange, ...extraArgs: ExtraArgs): R[]
  protected forceDayIfListItem = false // hack

  sliceProps(
    props: SliceableProps,
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): SlicedProps<R> {
    let { eventUiBases } = props
    let eventSegs = this.sliceEventStore(props.eventStore, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs)

    return {
      dateSelectionSegs: this.sliceDateSelection(props.dateSelection, dateProfile, nextDayThreshold, eventUiBases, context, ...extraArgs),
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
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): R[] {
    return this._sliceDateSpan(
      { range: { start: date, end: addMs(date, 1) }, allDay: false }, // add 1 ms, protect against null range
      dateProfile,
      nextDayThreshold,
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
  ): (R & EventRangeProps)[] {
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
  ): {
    bg: (R & EventRangeProps)[],
    fg: (R & EventRangeProps)[],
  } {
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
  ): EventSegUiInteractionState<R> {
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
    dateProfile: DateProfile,
    nextDayThreshold: Duration | null,
    eventUiBases: EventUiHash,
    context: CalendarContext,
    ...extraArgs: ExtraArgs
  ): (R & EventRangeProps)[] {
    if (!dateSpan) {
      return []
    }

    let activeRange = computeActiveRange(dateProfile, Boolean(nextDayThreshold))
    let activeDateSpanRange = intersectRanges(dateSpan.range, activeRange)

    if (activeDateSpanRange) {
      dateSpan = { ...dateSpan, range: activeDateSpanRange }

      let eventRange = fabricateEventRange(dateSpan, eventUiBases, context)
      let segs = this.sliceRange(dateSpan.range, ...extraArgs)

      for (let seg of segs) {
        (seg as any).eventRange = eventRange
      }

      return segs as any
    }

    return []
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private sliceEventRanges(
    eventRanges: EventRenderRange[],
    extraArgs: ExtraArgs,
  ): (R & EventRangeProps)[] {
    let segs: (R & EventRangeProps)[] = []

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
  ): (R & EventRangeProps)[] {
    let dateRange = eventRange.range

    // hack to make multi-day events that are being force-displayed as list-items to take up only one day
    if (this.forceDayIfListItem && eventRange.ui.display === 'list-item') {
      dateRange = {
        start: dateRange.start,
        end: addDays(dateRange.start, 1),
      }
    }

    let segs = this.sliceRange(dateRange, ...extraArgs) as any // !!!

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
