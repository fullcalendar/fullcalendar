import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Seg, EventSegUiInteractionState } from '../component/DateComponent'
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { sliceBusinessHours } from '../structs/business-hours'
import DateComponent from '../component/DateComponent'
import { Duration } from '../datelib/duration'
import reselector from '../util/reselector'
import { isPropsEqual } from '../util/object'

export function memoizeSlicer<
  SegType extends Seg,
  OtherArgsType extends { component: DateComponent<any> }, // TODO: kill component requirement
>(
  slicer: Slicer<SegType, OtherArgsType>
) {
  let buildInteraction = slicer.buildInteraction.bind(slicer) as typeof slicer.buildInteraction

  // WARNING: important to keep these memoizer equalityfuncs up to date with the signatures of the methods below!!!
  // YUCK
  return {
    businessHoursToSegs: reselector(slicer.businessHoursToSegs.bind(slicer) as typeof slicer.businessHoursToSegs, [ null, null, null, isPropsEqual ]),
    eventStoreToSegs: reselector(slicer.eventStoreToSegs.bind(slicer) as typeof slicer.eventStoreToSegs, [ null, isPropsEqual, isPropsEqual, null, null, isPropsEqual ]),
    selectionToSegs: reselector(slicer.dateSpanToCompleteSegs.bind(slicer) as typeof slicer.dateSpanToCompleteSegs, [ null, isPropsEqual, isPropsEqual ]),
    buildEventDrag: reselector(buildInteraction, [ null, isPropsEqual, isPropsEqual, null, null, isPropsEqual ]),
    buildEventResize: reselector(buildInteraction, [ null, isPropsEqual, isPropsEqual, null, null, isPropsEqual ])
  }
}

export class Slicer<
  SegType extends Seg,
  OtherArgsType extends { component: DateComponent<any> } // TODO: kill component requirement
> {

  slice: (range: DateRange, otherArgs: OtherArgsType) => SegType[]

  constructor(
    slice: (range: DateRange, otherArgs: OtherArgsType) => SegType[]
  ) {
    this.slice = slice
  }

  eventStoreToSegs(
    eventStore: EventStore,
    eventUiBases: EventUiHash,
    eventUiBySource: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    otherArgs: OtherArgsType
  ): { bg: SegType[], fg: SegType[] } {
    if (eventStore) {
      let rangeRes = sliceEventStore(eventStore, eventUiBases, eventUiBySource, dateProfile.activeRange, nextDayThreshold)

      return {
        bg: this.eventRangesToCompleteSegs(rangeRes.bg, otherArgs),
        fg: this.eventRangesToCompleteSegs(rangeRes.fg, otherArgs)
      }

    } else {
      return { bg: [], fg: [] }
    }
  }

  businessHoursToSegs (
    businessHours: EventStore,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    otherArgs: OtherArgsType
  ): SegType[] {
    if (!businessHours) {
      return []
    }

    return this.eventRangesToCompleteSegs(
      sliceBusinessHours(
        businessHours,
        dateProfile.activeRange,
        nextDayThreshold,
        otherArgs.component.calendar
      ),
      otherArgs
    )
  }

  dateSpanToCompleteSegs(
    dateSpan: DateSpan,
    eventUiBases: EventUiHash,
    otherArgs: OtherArgsType
  ): SegType[] {
    if (!dateSpan) {
      return []
    }

    let component = otherArgs.component
    let eventRange = fabricateEventRange(dateSpan, eventUiBases, component.calendar)
    let segs = this.dateSpanToSegs(dateSpan, otherArgs)

    for (let seg of segs) {
      seg.component = component
      seg.eventRange = eventRange
    }

    return segs
  }

  buildInteraction(
    interaction: EventInteractionState,
    eventUiBases: EventUiHash,
    eventUiBySource: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    otherArgs: OtherArgsType
  ): EventSegUiInteractionState {
    if (!interaction) {
      return null
    }

    let rangeRes = sliceEventStore(interaction.mutatedEvents, eventUiBases, eventUiBySource, dateProfile.activeRange, nextDayThreshold)

    return {
      segs: this.eventRangesToCompleteSegs(rangeRes.fg, otherArgs),
      affectedInstances: interaction.affectedEvents.instances,
      isEvent: interaction.isEvent,
      sourceSeg: interaction.origSeg
    }
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private eventRangesToCompleteSegs(eventRanges: EventRenderRange[], otherArgs: OtherArgsType): SegType[] {
    let segs: SegType[] = []

    for (let eventRange of eventRanges) {
      segs.push(...this.eventRangeToCompleteSegs(eventRange, otherArgs))
    }

    return segs
  }

  /*
  "complete" seg means it has component and eventRange
  */
  private eventRangeToCompleteSegs(eventRange: EventRenderRange, otherArgs: OtherArgsType): SegType[] {
    let component = otherArgs.component
    let segs = this.eventRangeToSegs(eventRange, otherArgs)

    for (let seg of segs) {
      seg.component = component
      seg.eventRange = eventRange
      seg.isStart = eventRange.isStart && seg.isStart
      seg.isEnd = eventRange.isEnd && seg.isEnd
    }

    return segs
  }

  protected dateSpanToSegs(dateSpan: DateSpan, otherArgs: OtherArgsType): SegType[] {
    return this.slice(dateSpan.range, otherArgs)
  }

  protected eventRangeToSegs(eventRange: EventRenderRange, otherArgs: OtherArgsType): SegType[] {
    return this.slice(eventRange.range, otherArgs)
  }

}
