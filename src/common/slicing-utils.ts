import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventUiHash, sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Seg } from '../component/DateComponent'
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { collectArrays } from '../util/array'
import { sliceBusinessHours } from '../structs/business-hours'
import DateComponent from '../component/DateComponent'
import { EventInstanceHash } from '../structs/event'
import { Duration } from '../datelib/duration'


export function buildEventStoreToSegs<OtherArgsType extends any[], SegType extends Seg>(
  sliceSegs: (dateRange: DateRange, ...args: OtherArgsType) => SegType[]
): (
  // returns a function with these args...
  eventStore: EventStore,
  eventUis: EventUiHash,
  dateProfile: DateProfile,
  nextDayThreshold: Duration,
  component: DateComponent<any>,
  ...args: OtherArgsType
) => SegType[] {
  return eventStoreToSegs.bind(null, sliceSegs)
}

export function buildBusinessHoursToSegs<OtherArgsType extends any[], SegType extends Seg>(
  sliceSegs: (dateRange: DateRange, ...args: OtherArgsType) => SegType[]
): (
  // returns a function with these args...
  businessHours: EventStore,
  dateProfile: DateProfile,
  nextDayThreshold: Duration,
  component: DateComponent<any>,
  ...args: OtherArgsType
) => SegType[] {
  return businessHoursToSegs.bind(null, sliceSegs)
}

export function buildDateSpanToSegs<OtherArgsType extends any[], SegType extends Seg>(
  sliceSegs: (dateRange: DateRange, ...args: OtherArgsType) => SegType[]
): (
  // returns a function with these args...
  dateSpan: DateSpan,
  component: DateComponent<any>,
  ...args: OtherArgsType
) => SegType[] {
  return dateSpanToSegs.bind(null, sliceSegs)
}

export function buildMassageInteraction<OtherArgsType extends any[], SegType extends Seg>(
  sliceSegs: (dateRange: DateRange, ...args: OtherArgsType) => SegType[]
): (
  // returns a function with these args...
  interaction: EventInteractionUiState,
  dateProfile: DateProfile,
  component: DateComponent<any>,
  ...args: OtherArgsType
) => {
  segs: SegType[],
  affectedInstances: EventInstanceHash,
  isEvent: boolean,
  sourceSeg: Seg
} {
  return massageInteraction.bind(null, sliceSegs)
}


type SliceSegsFunc = (range: DateRange, ...otherArgs) => Seg[]

function massageInteraction(
  sliceSegs: SliceSegsFunc,
  interaction: EventInteractionUiState,
  dateProfile: DateProfile,
  component: DateComponent<any>,
  ...otherArgs
) {
  if (!interaction) {
    return null
  }

  return {
    segs: eventRangesToSegs(
      sliceSegs,
      sliceEventStore(interaction.mutatedEvents, interaction.eventUis, dateProfile.activeRange),
      component,
      otherArgs
    ),
    affectedInstances: interaction.affectedEvents.instances,
    isEvent: interaction.isEvent,
    sourceSeg: interaction.origSeg
  }
}

function dateSpanToSegs(
  sliceSegs: SliceSegsFunc,
  dateSpan: DateSpan,
  component: DateComponent<any>,
  ...otherArgs
) {
  if (!dateSpan) {
    return []
  }

  let eventRange = fabricateEventRange(dateSpan)
  let segs = sliceSegs(dateSpan.range, ...otherArgs)

  for (let seg of segs) {
    seg.eventRange = eventRange
    seg.component = component
  }

  return segs
}

function businessHoursToSegs(
  sliceSegs: SliceSegsFunc,
  businessHours: EventStore,
  dateProfile: DateProfile,
  nextDayThreshold: Duration,
  component: DateComponent<any>,
  ...otherArgs
) {
  return eventRangesToSegs(
    sliceSegs,
    sliceBusinessHours(
      businessHours,
      dateProfile.activeRange,
      nextDayThreshold,
      component.calendar
    ),
    component,
    otherArgs
  )
}

function eventStoreToSegs(
  sliceSegs: SliceSegsFunc,
  eventStore: EventStore,
  eventUis: EventUiHash,
  dateProfile: DateProfile,
  nextDayThreshold: Duration,
  component: DateComponent<any>,
  ...otherArgs
) {
  return eventRangesToSegs(
    sliceSegs,
    sliceEventStore(eventStore, eventUis, dateProfile.activeRange, nextDayThreshold),
    component,
    otherArgs
  )
}

function eventRangesToSegs(sliceSegs: SliceSegsFunc, eventRanges: EventRenderRange[], component: DateComponent<any>, otherArgs) {
  return collectArrays(
    eventRangeToSegs.bind(null, sliceSegs),
    eventRanges,
    component,
    ...otherArgs
  )
}

function eventRangeToSegs(sliceSegs: SliceSegsFunc, eventRange: EventRenderRange, component: DateComponent<any>, ...otherArgs) {
  let segs = sliceSegs(eventRange.range, ...otherArgs)

  for (let seg of segs) {
    seg.eventRange = eventRange
    seg.component = component
    seg.isStart = eventRange.isStart && seg.isStart
    seg.isEnd = eventRange.isEnd && seg.isEnd
  }

  return segs
}
