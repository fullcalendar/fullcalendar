import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Seg, EventSegUiInteractionState } from '../component/DateComponent'
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { sliceBusinessHours } from '../structs/business-hours'
import DateComponent from '../component/DateComponent'
import { Duration } from '../datelib/duration'
import reselector from '../util/reselector'

export type GetComponentFunc = () => DateComponent<any> // TODO: kill

export function memoizeSlicer<OtherArgsType extends any[], SegType extends Seg>(
  slicer: Slicer<OtherArgsType, SegType>
) {
  return {
    businessHoursToSegs: reselector(slicer.businessHoursToSegs),
    eventStoreToSegs: reselector(slicer.eventStoreToSegs),
    selectionToSegs: reselector(slicer.dateSpanToCompleteSegs),
    buildEventDrag: reselector(slicer.buildInteraction),
    buildEventResize: reselector(slicer.buildInteraction)
  }
}

export class Slicer<OtherArgsType extends any[], SegType extends Seg> {

  slice: (range: DateRange, ...otherArgs: OtherArgsType) => SegType[]
  getComponent: GetComponentFunc // TODO: kill

  constructor(
    slice: (range: DateRange, ...otherArgs: OtherArgsType) => SegType[],
    getComponent: GetComponentFunc
  ) {
    this.slice = slice
    this.getComponent = getComponent
  }

  eventStoreToSegs = (
    eventStore: EventStore,
    eventUis: EventUiHash,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    ...otherArgs: OtherArgsType
  ): { bg: SegType[], fg: SegType[] } => {
    if (eventStore) {
      let rangeRes = sliceEventStore(eventStore, eventUis, dateProfile.activeRange, nextDayThreshold)

      return {
        bg: this.eventRangesToCompleteSegs(rangeRes.bg, otherArgs),
        fg: this.eventRangesToCompleteSegs(rangeRes.fg, otherArgs)
      }

    } else {
      return { bg: [], fg: [] }
    }
  }

  businessHoursToSegs = (
    businessHours: EventStore,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    ...otherArgs: OtherArgsType
  ): SegType[] => {
    if (!businessHours) {
      return []
    }

    return this.eventRangesToCompleteSegs(
      sliceBusinessHours(
        businessHours,
        dateProfile.activeRange,
        nextDayThreshold,
        this.getComponent().calendar
      ),
      otherArgs
    )
  }

  dateSpanToCompleteSegs = (
    dateSpan: DateSpan,
    ...otherArgs: OtherArgsType
  ): SegType[] => {
    if (!dateSpan) {
      return []
    }

    let component = this.getComponent()
    let eventRange = fabricateEventRange(dateSpan, component.calendar)
    let segs = this.dateSpanToSegs(dateSpan, otherArgs)

    for (let seg of segs) {
      seg.component = component
      seg.eventRange = eventRange
    }

    return segs
  }

  buildInteraction = (
    interaction: EventInteractionUiState,
    dateProfile: DateProfile,
    nextDayThreshold: Duration,
    ...otherArgs: OtherArgsType
  ): EventSegUiInteractionState => {
    if (!interaction) {
      return null
    }

    let rangeRes = sliceEventStore(interaction.mutatedEvents, interaction.eventUis, dateProfile.activeRange, nextDayThreshold)

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
    let component = this.getComponent()
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
    return this.slice(dateSpan.range, ...otherArgs)
  }

  protected eventRangeToSegs(eventRange: EventRenderRange, otherArgs: OtherArgsType): SegType[] {
    return this.slice(eventRange.range, ...otherArgs)
  }

}
