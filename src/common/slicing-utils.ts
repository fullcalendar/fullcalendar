import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventUiHash, sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Seg, EventSegUiInteractionState } from '../component/DateComponent'
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { sliceBusinessHours } from '../structs/business-hours'
import DateComponent from '../component/DateComponent'
import { Duration } from '../datelib/duration'
import reselector from '../util/reselector'


export class Slicer<OtherArgsType extends any[], SegType extends Seg> {

  slice: (range: DateRange, ...otherArgs: OtherArgsType) => SegType[]
  component: DateComponent<any> // must set after initialization. TODO: kill

  businessHoursToSegs = reselector(this._businessHoursToSegs)
  eventStoreToSegs = reselector(this._eventStoreToSegs)
  selectionToSegs = reselector(this.dateSpanToCompleteSegs)
  buildEventDrag = reselector(this.massageInteraction)
  buildEventResize = reselector(this.massageInteraction)

  constructor(slice: (range: DateRange, ...otherArgs: OtherArgsType) => SegType[]) {
    this.slice = slice
  }

  private _eventStoreToSegs(eventStore: EventStore, eventUis: EventUiHash, dateProfile: DateProfile, nextDayThreshold: Duration, ...otherArgs: OtherArgsType): SegType[] {
    if (!eventStore) {
      return []
    }

    return this.eventRangesToSegs(
      sliceEventStore(eventStore, eventUis, dateProfile.activeRange, nextDayThreshold),
      otherArgs
    )
  }

  private _businessHoursToSegs(businessHours: EventStore, dateProfile: DateProfile, nextDayThreshold: Duration, ...otherArgs: OtherArgsType): SegType[] {
    if (!businessHours) {
      return []
    }

    return this.eventRangesToSegs(
      sliceBusinessHours(
        businessHours,
        dateProfile.activeRange,
        nextDayThreshold,
        this.component.calendar
      ),
      otherArgs
    )
  }

  private dateSpanToCompleteSegs(dateSpan: DateSpan, ...otherArgs: OtherArgsType): SegType[] {

    if (!dateSpan) {
      return []
    }

    let eventRange = fabricateEventRange(dateSpan, this.component.calendar)
    let segs = this.dateSpanToSegs(dateSpan, otherArgs)

    for (let seg of segs) {
      seg.component = this.component
      seg.eventRange = eventRange
    }

    return segs
  }

  private massageInteraction(interaction: EventInteractionUiState, dateProfile: DateProfile, nextDayThreshold: Duration, ...otherArgs: OtherArgsType): EventSegUiInteractionState {

    if (!interaction) {
      return null
    }

    return {
      segs: this.eventRangesToSegs(
        sliceEventStore(interaction.mutatedEvents, interaction.eventUis, dateProfile.activeRange, nextDayThreshold),
        otherArgs
      ),
      affectedInstances: interaction.affectedEvents.instances,
      isEvent: interaction.isEvent,
      sourceSeg: interaction.origSeg
    }
  }

  private eventRangesToSegs(eventRanges: EventRenderRange[], otherArgs: OtherArgsType): SegType[] {
    let segs: SegType[] = []

    for (let eventRange of eventRanges) {
      segs.push(...this.eventRangeToCompleteSegs(eventRange, otherArgs))
    }

    return segs
  }

  private eventRangeToCompleteSegs(eventRange: EventRenderRange, otherArgs: OtherArgsType): SegType[] {
    let segs = this.eventRangeToSegs(eventRange, otherArgs)

    for (let seg of segs) {
      seg.component = this.component
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
