import DayGrid, { DayGridSeg } from './DayGrid'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-ui'
import { DateSpan } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import DayTable from '../common/DayTable'
import { Duration } from '../datelib/duration'
import DateComponent from '../component/DateComponent'
import { DateRange } from '../datelib/date-range'
import Slicer from '../common/slicing-utils'
import OffsetTracker from '../common/OffsetTracker'
import { Hit } from '../interactions/HitDragging'

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

  constructor(context, dayGrid: DayGrid) {
    super(context, dayGrid.el)

    this.dayGrid = dayGrid
  }

  render(props: SimpleDayGridProps) {
    let { dayGrid } = this
    let { dateProfile, dayTable } = props

    dayGrid.receiveProps(
      Object.assign({}, this.slicer.sliceProps(props, dateProfile, props.nextDayThreshold, dayGrid, dayTable), {
        dateProfile,
        cells: dayTable.cells,
        isRigid: props.isRigid
      })
    )
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

SimpleDayGrid.prototype.isInteractable = true


export class DayGridSlicer extends Slicer<DayGridSeg, [DayTable]> {

  sliceRange(dateRange: DateRange, dayTable: DayTable): DayGridSeg[] {
    return dayTable.sliceRange(dateRange)
  }

}
