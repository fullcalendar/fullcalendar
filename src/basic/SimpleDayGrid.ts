import DayGrid, { DayGridSeg } from './DayGrid'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import DayTable from '../common/DayTable'
import { Duration } from '../datelib/duration'
import Component from '../component/Component'
import { DateRange } from '../datelib/date-range'
import { Slicer } from '../common/slicing-utils'

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

  private slicer = new Slicer(sliceSegs)

  constructor(context, dayGrid: DayGrid) {
    super(context)

    this.dayGrid = dayGrid
    this.slicer.component = dayGrid
  }

  render(props: SimpleDayGridProps) {
    let { dayGrid, slicer, isRtl } = this
    let { dateProfile, dayTable, nextDayThreshold } = props

    dayGrid.receiveProps({
      dateProfile,
      cells: dayTable.cells,
      businessHourSegs: slicer.businessHoursToSegs(props.businessHours, dateProfile, nextDayThreshold, dayTable, isRtl),
      eventSegs: slicer.eventStoreToSegs(props.eventStore, props.eventUis, dateProfile, nextDayThreshold, dayTable, isRtl),
      dateSelectionSegs: slicer.selectionToSegs(props.dateSelection, dayTable, isRtl),
      eventSelection: props.eventSelection,
      eventDrag: slicer.buildEventDrag(props.eventDrag, dateProfile, nextDayThreshold, dayTable, isRtl),
      eventResize: slicer.buildEventResize(props.eventResize, dateProfile, nextDayThreshold, dayTable, isRtl),
      isRigid: props.isRigid
    })
  }

}

export function sliceSegs(range: DateRange, dayTable: DayTable, isRtl: boolean): DayGridSeg[] {
  return dayTable.sliceRange(range).map(function(seg) {
    return {
      isStart: seg.isStart,
      isEnd: seg.isEnd,
      row: seg.row,
      leftCol: isRtl ? (dayTable.colCnt - 1 - seg.lastCol) : seg.firstCol,
      rightCol: isRtl ? (dayTable.colCnt - 1 - seg.firstCol) : seg.lastCol
    }
  })
}
