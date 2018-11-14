import DayGrid, { DayGridSeg } from './DayGrid'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore } from '../structs/event-store'
import { EventUiHash, sliceEventStore, EventRenderRange } from '../component/event-rendering'
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import DayTable from '../common/DayTable'
import { Duration } from '../datelib/duration'
import reselector from '../util/reselector'
import { sliceBusinessHours } from '../structs/business-hours'
import Component from '../component/Component'

export interface SimpleDayGridProps {
  dateProfile: DateProfile | null
  dayTable: DayTable
  nextDayThreshold: Duration
  businessHours: EventStore
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
  isRigid: boolean
}

export default class SimpleDayGrid extends Component<SimpleDayGridProps> {

  dayGrid: DayGrid

  businessHoursToSegs = reselector(businessHoursToSegs)
  eventStoreToSegs = reselector(eventStoreToSegs)
  dateSpanToSegs = reselector(dateSpanToSegs)
  buildEventDrag = reselector(buildSegInteraction)
  buildEventResize = reselector(buildSegInteraction)

  constructor(context, dayGrid: DayGrid) {
    super(context)

    this.dayGrid = dayGrid
  }

  render(props: SimpleDayGridProps) {
    let { dayGrid } = this
    let { dateProfile, dayTable, nextDayThreshold } = props

    dayGrid.receiveProps({
      dateProfile,
      cells: dayTable.cells,
      businessHourSegs: this.businessHoursToSegs(props.businessHours, dateProfile, dayTable, nextDayThreshold, dayGrid),
      eventSegs: this.eventStoreToSegs(props.eventStore, props.eventUis, dateProfile, dayTable, nextDayThreshold, dayGrid),
      dateSelectionSegs: this.dateSpanToSegs(props.dateSelection, dayTable, dayGrid),
      eventSelection: props.eventSelection,
      eventDrag: this.buildEventDrag(props.eventDrag, dateProfile, dayTable, nextDayThreshold, dayGrid),
      eventResize: this.buildEventResize(props.eventResize, dateProfile, dayTable, nextDayThreshold, dayGrid),
      isRigid: props.isRigid
    })
  }

}

function eventStoreToSegs(eventStore: EventStore, eventUis: EventUiHash, dateProfile: DateProfile, dayTable: DayTable, nextDayThreshold: Duration, dayGrid: DayGrid) {
  return eventRangesToSegs(
    sliceEventStore(eventStore, eventUis, dateProfile.activeRange, nextDayThreshold),
    dayTable,
    dayGrid
  )
}

function businessHoursToSegs(businessHours: EventStore, dateProfile: DateProfile, dayTable: DayTable, nextDayThreshold: Duration, dayGrid: DayGrid) {
  return eventRangesToSegs(
    sliceBusinessHours(businessHours, dateProfile.activeRange, nextDayThreshold, dayGrid.calendar),
    dayTable,
    dayGrid
  )
}

function dateSpanToSegs(dateSpan: DateSpan, dayTable: DayTable, dayGrid: DayGrid) {
  return dateSpan ? sliceDateSpan(dateSpan, dayTable, dayGrid) : null
}

function buildSegInteraction(interaction: EventInteractionUiState, dateProfile: DateProfile, dayTable: DayTable, nextDayThreshold: Duration, dayGrid: DayGrid) {
  if (!interaction) {
    return null
  }

  return {
    segs: eventRangesToSegs(
      sliceEventStore(interaction.mutatedEvents, interaction.eventUis, dateProfile.activeRange, nextDayThreshold),
      dayTable,
      dayGrid
    ),
    affectedInstances: interaction.affectedEvents.instances,
    isEvent: interaction.isEvent,
    sourceSeg: interaction.origSeg
  }
}

function eventRangesToSegs(eventRanges: EventRenderRange[], dayTable: DayTable, dayGrid: DayGrid): DayGridSeg[] {
  let segs = []

  for (let eventRange of eventRanges) {
    segs.push(...eventRangeToSegs(eventRange, dayTable, dayGrid))
  }

  return segs
}

function eventRangeToSegs(eventRange: EventRenderRange, dayTable: DayTable, dayGrid: DayGrid): DayGridSeg[] {
  return dayTable.sliceRange(eventRange.range).map(function(seg) {
    return {
      eventRange,
      component: dayGrid,
      isStart: eventRange.isStart && seg.isStart,
      isEnd: eventRange.isEnd && seg.isEnd,
      row: seg.row,
      leftCol: dayGrid.isRtl ? (dayTable.colCnt - 1 - seg.lastCol) : seg.firstCol,
      rightCol: dayGrid.isRtl ? (dayTable.colCnt - 1 - seg.firstCol) : seg.lastCol
    }
  })
}

function sliceDateSpan(dateSpan: DateSpan, dayTable: DayTable, dayGrid: DayGrid): DayGridSeg[] {
  let eventRange = fabricateEventRange(dateSpan)

  return dayTable.sliceRange(dateSpan.range).map(function(seg) {
    return {
      component: dayGrid,
      eventRange,
      isStart: seg.isStart,
      isEnd: seg.isEnd,
      row: seg.row,
      leftCol: dayGrid.isRtl ? (dayTable.colCnt - 1 - seg.lastCol) : seg.firstCol,
      rightCol: dayGrid.isRtl ? (dayTable.colCnt - 1 - seg.firstCol) : seg.lastCol
    }
  })
}
