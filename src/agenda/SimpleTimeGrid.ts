import TimeGrid, { TimeGridSeg } from './TimeGrid'
import Component from '../component/Component'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore } from '../structs/event-store'
import { EventUiHash, EventRenderRange, sliceEventStore } from '../component/event-rendering'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { DateSpan, fabricateEventRange } from '../structs/date-span'
import reselector from '../util/reselector'
import { intersectRanges, DateRange } from '../datelib/date-range'
import { sliceBusinessHours } from '../structs/business-hours'
import DayTable from '../common/DayTable'
import { DateEnv } from '../datelib/env'
import { DateMarker, addMs } from '../datelib/marker'

export interface SimpleTimeGridProps {
  dateProfile: DateProfile | null
  dayTable: DayTable
  businessHours: EventStore
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
}

export default class SimpleTimeGrid extends Component<SimpleTimeGridProps> {

  timeGrid: TimeGrid
  colRanges: DateRange[]

  buildColRanges = reselector(buildColRanges)
  eventStoreToSegs = reselector(eventStoreToSegs)
  businessHoursToSegs = reselector(businessHoursToSegs)
  selectionToSegs = reselector(dateSpanToSegs)
  buildEventDrag = reselector(buildSegInteraction)
  buildEventResize = reselector(buildSegInteraction)

  constructor(context, timeGrid: TimeGrid) {
    super(context)

    this.timeGrid = timeGrid
  }

  render(props: SimpleTimeGridProps) {
    let { timeGrid } = this
    let { dateProfile, dayTable } = props

    let colRanges = this.colRanges =
      this.buildColRanges(dayTable, dateProfile, this.dateEnv)

    timeGrid.receiveProps({
      dateProfile,
      cells: dayTable.cells[0],
      businessHourSegs: this.businessHoursToSegs(props.businessHours, dateProfile, colRanges, timeGrid),
      eventSegs: this.eventStoreToSegs(props.eventStore, props.eventUis, dateProfile, colRanges, timeGrid),
      dateSelectionSegs: this.selectionToSegs(props.dateSelection, colRanges, timeGrid),
      eventSelection: props.eventSelection,
      eventDrag: this.buildEventDrag(props.eventDrag, props.eventUis, dateProfile, colRanges, timeGrid),
      eventResize: this.buildEventResize(props.eventResize, props.eventUis, dateProfile, colRanges, timeGrid)
    })
  }

  renderNowIndicator(date: DateMarker) {
    this.timeGrid.renderNowIndicator(

      // seg system might be overkill, but it handles scenario where line needs to be rendered
      //  more than once because of columns with the same date (resources columns for example)
      dateSpanToSegs({
        range: {
          start: date,
          end: addMs(date, 1) // protect against null range
        },
        allDay: false
      }, this.colRanges, this.timeGrid),

      date
    )
  }

}

function buildColRanges(dayTable: DayTable, dateProfile: DateProfile, dateEnv: DateEnv): DateRange[] {
  let ranges: DateRange[] = []

  for (let col = 0; col < dayTable.colCnt; col++) {
    let date = dayTable.cells[0][col].date

    ranges.push({
      start: dateEnv.add(date, dateProfile.minTime),
      end: dateEnv.add(date, dateProfile.maxTime)
    })
  }

  return ranges
}

function eventStoreToSegs(eventStore: EventStore, eventUis: EventUiHash, dateProfile: DateProfile, colRanges: DateRange[], timeGrid: TimeGrid) {
  return eventRangesToSegs(
    sliceEventStore(eventStore, eventUis, dateProfile.activeRange),
    colRanges,
    timeGrid
  )
}

function businessHoursToSegs(businessHours: EventStore, dateProfile: DateProfile, colRanges: DateRange[], timeGrid: TimeGrid) {
  return eventRangesToSegs(
    sliceBusinessHours(businessHours, dateProfile.activeRange, null, timeGrid.calendar),
    colRanges,
    timeGrid
  )
}

function buildSegInteraction(interaction: EventInteractionUiState, eventUis: EventUiHash, dateProfile: DateProfile, colRanges: DateRange[], timeGrid: TimeGrid) {
  if (!interaction) {
    return null
  }

  return {
    segs: eventRangesToSegs(
      sliceEventStore(interaction.mutatedEvents, eventUis, dateProfile.activeRange),
      colRanges,
      timeGrid
    ),
    affectedInstances: interaction.affectedEvents.instances,
    isEvent: interaction.isEvent,
    sourceSeg: interaction.origSeg
  }
}

function dateSpanToSegs(dateSpan: DateSpan, colRanges: DateRange[], timeGrid: TimeGrid): TimeGridSeg[] {

  if (!dateSpan) {
    return []
  }

  let eventRange = fabricateEventRange(dateSpan)
  let { range } = dateSpan
  let segs: TimeGridSeg[] = []

  for (let col = 0; col < colRanges.length; col++) {
    let segRange = intersectRanges(range, colRanges[col])

    if (segRange) {
      segs.push({
        component: timeGrid,
        eventRange,
        start: segRange.start,
        end: segRange.end,
        isStart: segRange.start.valueOf() === range.start.valueOf(),
        isEnd: segRange.end.valueOf() === range.end.valueOf(),
        col
      })
    }
  }

  return segs
}

function eventRangesToSegs(eventRanges: EventRenderRange[], colRanges: DateRange[], timeGrid: TimeGrid): TimeGridSeg[] {
  let segs = []

  for (let eventRange of eventRanges) {
    segs.push(...eventRangeToSegs(colRanges, eventRange, timeGrid))
  }

  return segs
}

function eventRangeToSegs(colRanges: DateRange[], eventRange: EventRenderRange, timeGrid: TimeGrid): TimeGridSeg[] {
  let { range } = eventRange
  let segs = []

  for (let col = 0; col < colRanges.length; col++) {
    let segRange = intersectRanges(range, colRanges[col])

    if (segRange) {
      segs.push({
        component: timeGrid,
        eventRange,
        start: segRange.start,
        end: segRange.end,
        isStart: segRange.start.valueOf() === range.start.valueOf(),
        isEnd: segRange.end.valueOf() === range.end.valueOf(),
        col
      })
    }
  }

  return segs
}
