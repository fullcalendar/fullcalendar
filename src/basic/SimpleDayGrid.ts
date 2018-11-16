import DayGrid, { DayGridSeg } from './DayGrid'
import { DateProfile } from '../DateProfileGenerator'
import { EventStore } from '../structs/event-store'
import { EventUiHash } from '../component/event-rendering'
import { DateSpan } from '../structs/date-span'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import DayTable from '../common/DayTable'
import { Duration } from '../datelib/duration'
import reselector from '../util/reselector'
import Component from '../component/Component'
import { DateRange } from '../datelib/date-range'
import { buildBusinessHoursToSegs, buildEventStoreToSegs, buildDateSpanToSegs, buildMassageInteraction } from '../common/slicing-utils'

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

  businessHoursToSegs = reselector(buildBusinessHoursToSegs(sliceSegs))
  eventStoreToSegs = reselector(buildEventStoreToSegs(sliceSegs))
  selectionToSegs = reselector(buildDateSpanToSegs(sliceSegs))
  buildEventDrag = reselector(buildMassageInteraction(sliceSegs))
  buildEventResize = reselector(buildMassageInteraction(sliceSegs))

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
      businessHourSegs: this.businessHoursToSegs(props.businessHours, dateProfile, nextDayThreshold, dayGrid, dayTable, dayGrid),
      eventSegs: this.eventStoreToSegs(props.eventStore, props.eventUis, dateProfile, nextDayThreshold, dayGrid, dayTable, dayGrid),
      dateSelectionSegs: this.selectionToSegs(props.dateSelection, dayGrid, dayTable, dayGrid),
      eventSelection: props.eventSelection,
      eventDrag: this.buildEventDrag(props.eventDrag, dateProfile, dayGrid, dayTable, dayGrid),
      eventResize: this.buildEventResize(props.eventResize, dateProfile, dayGrid, dayTable, dayGrid),
      isRigid: props.isRigid
    })
  }

}

/*
TODO: kill the inconvenient-to-call dayGrid argument when RTL is done differently
*/
function sliceSegs(range: DateRange, dayTable: DayTable, dayGrid: DayGrid): DayGridSeg[] {
  return dayTable.sliceRange(range).map(function(seg) {
    return {
      isStart: seg.isStart,
      isEnd: seg.isEnd,
      row: seg.row,
      leftCol: dayGrid.isRtl ? (dayTable.colCnt - 1 - seg.lastCol) : seg.firstCol,
      rightCol: dayGrid.isRtl ? (dayTable.colCnt - 1 - seg.firstCol) : seg.lastCol
    }
  })
}
