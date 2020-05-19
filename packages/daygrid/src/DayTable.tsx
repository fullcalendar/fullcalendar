import {
  createElement, createRef, VNode,
  EventStore,
  EventUiHash,
  DateSpan,
  EventInteractionState,
  DayTableModel,
  Duration,
  DateComponent,
  DateRange,
  Slicer,
  ViewContext,
  RefObject,
  CssDimValue,
  Hit,
  DateProfile
} from '@fullcalendar/common'
import { Table } from './Table'
import { TableSeg } from './TableSeg'


export interface DayTableProps {
  dateProfile: DateProfile,
  dayTableModel: DayTableModel
  nextDayThreshold: Duration
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  colGroupNode: VNode
  tableMinWidth: CssDimValue
  renderRowIntro?: () => VNode
  dayMaxEvents: boolean | number
  dayMaxEventRows: boolean | number
  expandRows: boolean
  showWeekNumbers: boolean
  headerAlignElRef?: RefObject<HTMLElement> // for more popover alignment
  clientWidth: number | null
  clientHeight: number | null
}

export class DayTable extends DateComponent<DayTableProps, ViewContext> {

  private slicer = new DayTableSlicer()
  private tableRef = createRef<Table>()


  render() {
    let { props, context } = this

    return (
      <Table
        ref={this.tableRef}
        elRef={this.handleRootEl}
        { ...this.slicer.sliceProps(props, props.dateProfile, props.nextDayThreshold, context, props.dayTableModel) }
        dateProfile={props.dateProfile}
        cells={props.dayTableModel.cells}
        colGroupNode={props.colGroupNode}
        tableMinWidth={props.tableMinWidth}
        renderRowIntro={props.renderRowIntro}
        dayMaxEvents={props.dayMaxEvents}
        dayMaxEventRows={props.dayMaxEventRows}
        showWeekNumbers={props.showWeekNumbers}
        expandRows={props.expandRows}
        headerAlignElRef={props.headerAlignElRef}
        clientWidth={props.clientWidth}
        clientHeight={props.clientHeight}
      />
    )
  }


  handleRootEl = (rootEl: HTMLDivElement | null) => {
    if (rootEl) {
      this.context.registerInteractiveComponent(this, { el: rootEl })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }


  prepareHits() {
    this.tableRef.current.prepareHits()
  }


  queryHit(positionLeft: number, positionTop: number): Hit {
    let rawHit = this.tableRef.current.positionToHit(positionLeft, positionTop)

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

  forceDayIfListItem = true

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): TableSeg[] {
    return dayTableModel.sliceRange(dateRange)
  }

}
