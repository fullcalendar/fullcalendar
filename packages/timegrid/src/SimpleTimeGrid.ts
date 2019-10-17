import {
  DateComponent,
  DateProfile,
  EventStore,
  EventUiHash,
  EventInteractionState,
  DateSpan,
  memoize,
  intersectRanges, DateRange,
  DayTable,
  DateEnv,
  DateMarker,
  Slicer,
  Hit,
  ComponentContext
} from '@fullcalendar/core'
import TimeGrid, { TimeGridSeg } from './TimeGrid'

export interface SimpleTimeGridProps {
  dateProfile: DateProfile | null
  dayTable: DayTable
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
}

export default class SimpleTimeGrid extends DateComponent<SimpleTimeGridProps> {

  timeGrid: TimeGrid

  private buildDayRanges = memoize(buildDayRanges)
  private dayRanges: DateRange[] // for now indicator
  private slicer = new TimeGridSlicer()

  constructor(timeGrid: TimeGrid) {
    super(timeGrid.el)

    this.timeGrid = timeGrid
  }

  firstContext(context: ComponentContext) {
    context.calendar.registerInteractiveComponent(this, {
      el: this.timeGrid.el
    })
  }

  destroy() {
    super.destroy()

    this.context.calendar.unregisterInteractiveComponent(this)
  }

  render(props: SimpleTimeGridProps, context: ComponentContext) {
    let { dateEnv } = this.context
    let { dateProfile, dayTable } = props
    let dayRanges = this.dayRanges = this.buildDayRanges(dayTable, dateProfile, dateEnv)

    this.timeGrid.receiveProps({
      ...this.slicer.sliceProps(props, dateProfile, null, context.calendar, this.timeGrid, dayRanges),
      dateProfile,
      cells: dayTable.cells[0]
    }, context)
  }

  renderNowIndicator(date: DateMarker) {
    this.timeGrid.renderNowIndicator(
      this.slicer.sliceNowDate(date, this.timeGrid, this.dayRanges),
      date
    )
  }

  buildPositionCaches() {
    this.timeGrid.buildPositionCaches()
  }

  queryHit(positionLeft: number, positionTop: number): Hit {
    let rawHit = this.timeGrid.positionToHit(positionLeft, positionTop)

    if (rawHit) {
      return {
        component: this.timeGrid,
        dateSpan: rawHit.dateSpan,
        dayEl: rawHit.dayEl,
        rect: {
          left: rawHit.relativeRect.left,
          right: rawHit.relativeRect.right,
          top: rawHit.relativeRect.top,
          bottom: rawHit.relativeRect.bottom
        },
        layer: 0
      }
    }
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


export class TimeGridSlicer extends Slicer<TimeGridSeg, [DateRange[]]> {

  sliceRange(range: DateRange, dayRanges: DateRange[]): TimeGridSeg[] {
    let segs: TimeGridSeg[] = []

    for (let col = 0; col < dayRanges.length; col++) {
      let segRange = intersectRanges(range, dayRanges[col])

      if (segRange) {
        segs.push({
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

}
