import { Duration, CssDimValue } from '@fullcalendar/core'
import {
  EventStore,
  EventUiHash,
  DateSpan,
  EventInteractionState,
  DayTableModel,
  DateComponent,
  ViewContext,
  DateProfile,
} from '@fullcalendar/core/internal'
import {
  createElement,
  createRef,
  VNode,
  RefObject,
} from '@fullcalendar/core/preact'
import { Table } from './Table.js'
import { DayTableSlicer } from './DayTableSlicer.js'

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
  forPrint: boolean
}

export class DayTable extends DateComponent<DayTableProps, ViewContext> {
  private slicer = new DayTableSlicer()
  private tableRef = createRef<Table>()

  render() {
    let { props, context } = this

    return (
      <Table
        ref={this.tableRef}
        {...this.slicer.sliceProps(props, props.dateProfile, props.nextDayThreshold, context, props.dayTableModel)}
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
        forPrint={props.forPrint}
      />
    )
  }
}
