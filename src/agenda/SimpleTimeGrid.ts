import TimeGrid, { TimeGridSeg } from './TimeGrid'
import DateComponent from '../component/DateComponent'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { DateSpan } from '../structs/date-span'
import reselector from '../util/reselector'
import { intersectRanges, DateRange } from '../datelib/date-range'
import DayTable from '../common/DayTable'
import { DateEnv } from '../datelib/env'
import { DateMarker } from '../datelib/marker'
import Slicer from '../common/slicing-utils'
import OffsetTracker from '../common/OffsetTracker'
import { Hit } from '../interactions/HitDragging'

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
  dayRanges: DateRange[] // for now indicator
  offsetTracker: OffsetTracker

  private buildDayRanges = reselector(buildDayRanges)
  private slicer = new TimeGridSlicer()

  constructor(context, timeGrid: TimeGrid) {
    super(context, timeGrid.el)

    this.timeGrid = timeGrid
  }

  render(props: SimpleTimeGridProps) {
    let { dateProfile, dayTable } = props
    let dayRanges = this.dayRanges = this.buildDayRanges(dayTable, dateProfile, this.dateEnv)

    this.timeGrid.receiveProps(
      Object.assign({}, this.slicer.sliceProps(props, dateProfile, null, this.timeGrid, dayRanges), {
        dateProfile,
        cells: dayTable.cells[0]
      })
    )
  }

  renderNowIndicator(date: DateMarker) {
    this.timeGrid.renderNowIndicator(
      this.slicer.sliceNowDate(date, this.timeGrid, this.dayRanges),
      date
    )
  }

  prepareHits() {
    this.offsetTracker = new OffsetTracker(this.timeGrid.el)
  }

  releaseHits() {
    this.offsetTracker.destroy()
  }

  queryHit(leftOffset, topOffset): Hit {
    let { offsetTracker } = this

    if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
      let originLeft = offsetTracker.computeLeft()
      let originTop = offsetTracker.computeTop()

      let rawHit = this.timeGrid.positionToHit(
        leftOffset - originLeft,
        topOffset - originTop
      )

      if (rawHit) {
        return {
          component: this.timeGrid,
          dateSpan: rawHit.dateSpan,
          dayEl: rawHit.dayEl,
          rect: {
            left: rawHit.relativeRect.left + originLeft,
            right: rawHit.relativeRect.right + originLeft,
            top: rawHit.relativeRect.top + originTop,
            bottom: rawHit.relativeRect.bottom + originTop
          },
          layer: 0
        }
      }
    }
  }

}

SimpleTimeGrid.prototype.isInteractable = true


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
