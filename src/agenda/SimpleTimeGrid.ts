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
import DateComponent, { EventSegUiInteractionState } from '../component/DateComponent'

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
  dayRanges: DateRange[]

  buildDayRanges = reselector(buildDayRanges)
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

    let dayRanges = this.dayRanges =
      this.buildDayRanges(dayTable, dateProfile, this.dateEnv)

    timeGrid.receiveProps({
      dateProfile,
      cells: dayTable.cells[0],
      businessHourSegs: this.businessHoursToSegs(props.businessHours, dateProfile, dayRanges, timeGrid),
      eventSegs: this.eventStoreToSegs(props.eventStore, props.eventUis, dateProfile, dayRanges, timeGrid),
      dateSelectionSegs: this.selectionToSegs(props.dateSelection, dayRanges, timeGrid),
      eventSelection: props.eventSelection,
      eventDrag: this.buildEventDrag(props.eventDrag, dateProfile, dayRanges, timeGrid),
      eventResize: this.buildEventResize(props.eventResize, dateProfile, dayRanges, timeGrid)
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
      }, this.dayRanges, this.timeGrid),

      date
    )
  }

}

export function buildDayRanges(dayTable: DayTable, dateProfile: DateProfile, dateEnv: DateEnv): DateRange[] {
  let ranges: DateRange[] = []

  for (let date of dayTable.headerDates) {
    ranges.push({
      start: dateEnv.add(date, dateProfile.minTime),
      end: dateEnv.add(date, dateProfile.maxTime)
    })
  }

  return ranges
}

function eventStoreToSegs(eventStore: EventStore, eventUis: EventUiHash, dateProfile: DateProfile, dayRanges: DateRange[], timeGrid: TimeGrid) {
  return eventRangesToSegs(
    sliceEventStore(eventStore, eventUis, dateProfile.activeRange),
    dayRanges,
    timeGrid
  )
}

function businessHoursToSegs(businessHours: EventStore, dateProfile: DateProfile, dayRanges: DateRange[], timeGrid: TimeGrid) {
  return eventRangesToSegs(
    sliceBusinessHours(businessHours, dateProfile.activeRange, null, timeGrid.calendar),
    dayRanges,
    timeGrid
  )
}

function buildSegInteraction(interaction: EventInteractionUiState, dateProfile: DateProfile, dayRanges: DateRange[], timeGrid: TimeGrid): EventSegUiInteractionState {
  if (!interaction) {
    return null
  }

  return {
    segs: eventRangesToSegs(
      sliceEventStore(interaction.mutatedEvents, interaction.eventUis, dateProfile.activeRange),
      dayRanges,
      timeGrid
    ),
    affectedInstances: interaction.affectedEvents.instances,
    isEvent: interaction.isEvent,
    sourceSeg: interaction.origSeg
  }
}

export function dateSpanToSegs(dateSpan: DateSpan, dayRanges: DateRange[], component: DateComponent<any>): TimeGridSeg[] {

  if (!dateSpan) {
    return []
  }

  let eventRange = fabricateEventRange(dateSpan)

  return buildSegs(dateSpan.range, dayRanges, eventRange, component)
}

function eventRangesToSegs(eventRanges: EventRenderRange[], dayRanges: DateRange[], timeGrid: TimeGrid): TimeGridSeg[] {
  let segs = []

  for (let eventRange of eventRanges) {
    segs.push(...eventRangeToSegs(eventRange, dayRanges, timeGrid))
  }

  return segs
}

export function eventRangeToSegs(eventRange: EventRenderRange, dayRanges: DateRange[], component: DateComponent<any>): TimeGridSeg[] {
  let segs = buildSegs(eventRange.range, dayRanges, eventRange, component)

  for (let seg of segs) {
    seg.isStart = eventRange.isStart && seg.isStart
    seg.isEnd = eventRange.isEnd && seg.isEnd
  }

  return segs
}


function buildSegs(range: DateRange, dayRanges: DateRange[], eventRange: EventRenderRange, component: DateComponent<any>): TimeGridSeg[] {
  let segs: TimeGridSeg[] = []

  for (let col = 0; col < dayRanges.length; col++) {
    let segRange = intersectRanges(range, dayRanges[col])

    if (segRange) {
      segs.push({
        component,
        eventRange: eventRange,
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
