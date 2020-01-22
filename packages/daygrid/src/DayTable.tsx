import {
  h, createRef, VNode,
  DateProfile,
  EventStore,
  EventUiHash,
  DateSpan,
  EventInteractionState,
  DayTableModel,
  Duration,
  DateComponent,
  DateRange,
  Slicer,
  Hit,
  ComponentContext
} from '@fullcalendar/core'
import Table, { TableSeg  } from './Table'


export interface DayTableProps {
  dateProfile: DateProfile | null
  dayTableModel: DayTableModel
  nextDayThreshold: Duration
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  isRigid: boolean
  colGroupNode: VNode
  renderNumberIntro: (row: number, cells: any) => VNode[]
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
  colWeekNumbersVisible: boolean // week numbers render in own column? (caller does HTML via intro)
  cellWeekNumbersVisible: boolean // display week numbers in day cell?
  eventLimit: boolean | number
  vGrow: boolean
}

export default class DayTable extends DateComponent<DayTableProps, ComponentContext> {

  private slicer = new DayTableSlicer()
  private tableRef = createRef<Table>()

  get table() { return this.tableRef.current }


  render(props: DayTableProps, state: {}, context: ComponentContext) {
    let { dateProfile, dayTableModel } = props

    return (
      <Table
        ref={this.tableRef}
        rootElRef={this.handleRootEl}
        { ...this.slicer.sliceProps(props, dateProfile, props.nextDayThreshold, context.calendar, dayTableModel) }
        dateProfile={dateProfile}
        cells={dayTableModel.cells}
        isRigid={props.isRigid}
        colGroupNode={props.colGroupNode}
        renderNumberIntro={props.renderNumberIntro}
        renderBgIntro={props.renderBgIntro}
        renderIntro={props.renderIntro}
        colWeekNumbersVisible={props.colWeekNumbersVisible}
        cellWeekNumbersVisible={props.cellWeekNumbersVisible}
        eventLimit={props.eventLimit}
        vGrow={props.vGrow}
      />
    )
  }


  handleRootEl = (rootEl: HTMLDivElement | null) => {
    let { calendar } = this.context

    if (rootEl) {
      calendar.registerInteractiveComponent(this, { el: rootEl })
    } else {
      calendar.unregisterInteractiveComponent(this)
    }
  }


  buildPositionCaches() {
    this.table.buildPositionCaches()
  }


  queryHit(positionLeft: number, positionTop: number): Hit {
    let rawHit = this.table.positionToHit(positionLeft, positionTop)

    if (rawHit) {
      return {
        component: this,
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


export class DayTableSlicer extends Slicer<TableSeg, [DayTableModel]> {

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): TableSeg[] {
    return dayTableModel.sliceRange(dateRange)
  }

}
