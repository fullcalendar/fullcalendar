import {
  DateProfile,
  EventStore,
  EventUiHash,
  DateSpan,
  EventInteractionState,
  DayTable,
  Duration,
  DateComponent,
  DateRange,
  Slicer,
  OffsetTracker,
  Hit,
  ComponentContext
} from '@fullcalendar/core'
import { default as DayGrid, DayGridSeg } from './DayGrid'

export interface SimpleDayGridProps {
  dateProfile: DateProfile | null
  dayTable: DayTable
  nextDayThreshold: Duration
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  isRigid: boolean
}

export default class SimpleDayGrid extends DateComponent<SimpleDayGridProps> {

  dayGrid: DayGrid
  offsetTracker: OffsetTracker

  private slicer = new DayGridSlicer()

  constructor(context: ComponentContext, dayGrid: DayGrid) {
    super(context, dayGrid.el)

    this.dayGrid = dayGrid

    context.calendar.registerInteractiveComponent(this, { el: this.dayGrid.el })
  }

  destroy() {
    super.destroy()

    this.calendar.unregisterInteractiveComponent(this)
  }

  render(props: SimpleDayGridProps) {
    let { dayGrid } = this
    let { dateProfile, dayTable } = props

    dayGrid.receiveProps({
      ...this.slicer.sliceProps(props, dateProfile, props.nextDayThreshold, dayGrid, dayTable),
      dateProfile,
      cells: dayTable.cells,
      isRigid: props.isRigid
    })
  }

  prepareHits() {
    this.offsetTracker = new OffsetTracker(this.dayGrid.el)
  }

  releaseHits() {
    this.offsetTracker.destroy()
  }

  queryHit(leftOffset, topOffset): Hit {
    let { offsetTracker } = this

    if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
      let originLeft = offsetTracker.computeLeft()
      let originTop = offsetTracker.computeTop()

      let rawHit = this.dayGrid.positionToHit(
        leftOffset - originLeft,
        topOffset - originTop
      )

      if (rawHit) {
        return {
          component: this.dayGrid,
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


export class DayGridSlicer extends Slicer<DayGridSeg, [DayTable]> {

  sliceRange(dateRange: DateRange, dayTable: DayTable): DayGridSeg[] {
    return dayTable.sliceRange(dateRange)
  }

}
