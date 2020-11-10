import {
  createElement, createRef,
  DayHeader,
  DateProfileGenerator,
  DateProfile,
  memoize,
  DaySeriesModel,
  DayTableModel,
  ChunkContentCallbackArgs,
} from '@fullcalendar/common'
import { TableView } from './TableView'
import { DayTable } from './DayTable'

export class DayTableView extends TableView {
  private buildDayTableModel = memoize(buildDayTableModel)
  private headerRef = createRef<DayHeader>()
  private tableRef = createRef<DayTable>()

  render() {
    let { options, dateProfileGenerator } = this.context
    let { props } = this
    let dayTableModel = this.buildDayTableModel(props.dateProfile, dateProfileGenerator)

    let headerContent = options.dayHeaders && (
      <DayHeader
        ref={this.headerRef}
        dateProfile={props.dateProfile}
        dates={dayTableModel.headerDates}
        datesRepDistinctDays={dayTableModel.rowCnt === 1}
      />
    )

    let bodyContent = (contentArg: ChunkContentCallbackArgs) => (
      <DayTable
        ref={this.tableRef}
        dateProfile={props.dateProfile}
        dayTableModel={dayTableModel}
        businessHours={props.businessHours}
        dateSelection={props.dateSelection}
        eventStore={props.eventStore}
        eventUiBases={props.eventUiBases}
        eventSelection={props.eventSelection}
        eventDrag={props.eventDrag}
        eventResize={props.eventResize}
        nextDayThreshold={options.nextDayThreshold}
        colGroupNode={contentArg.tableColGroupNode}
        tableMinWidth={contentArg.tableMinWidth}
        dayMaxEvents={options.dayMaxEvents}
        dayMaxEventRows={options.dayMaxEventRows}
        showWeekNumbers={options.weekNumbers}
        expandRows={!props.isHeightAuto}
        headerAlignElRef={this.headerElRef}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
        forPrint={props.forPrint}
      />
    )

    return options.dayMinWidth
      ? this.renderHScrollLayout(headerContent, bodyContent, dayTableModel.colCnt, options.dayMinWidth)
      : this.renderSimpleLayout(headerContent, bodyContent)
  }
}

export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit),
  )
}
