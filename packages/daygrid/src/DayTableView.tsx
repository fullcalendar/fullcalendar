import {
  h, createRef,
  DayHeader,
  ComponentContext,
  DateProfileGenerator,
  DateProfile,
  ViewProps,
  memoize,
  DaySeries,
  DayTableModel,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import TableView from './TableView'
import DayTable from './DayTable'


export default class DayTableView extends TableView {

  private buildDayTableModel = memoize(buildDayTableModel)
  private headerRef = createRef<DayHeader>()
  private tableRef = createRef<DayTable>()


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { dateProfile } = props
    let dayTableModel = this.buildDayTableModel(dateProfile, props.dateProfileGenerator)

    let headerContent = options.dayHeaders &&
      <DayHeader
        ref={this.headerRef}
        dateProfile={dateProfile}
        dates={dayTableModel.headerDates}
        datesRepDistinctDays={dayTableModel.rowCnt === 1}
      />

    let bodyContent = (contentArg: ChunkContentCallbackArgs) => (
      <DayTable
        ref={this.tableRef}
        dateProfile={dateProfile}
        dayTableModel={dayTableModel}
        businessHours={props.businessHours}
        dateSelection={props.dateSelection}
        eventStore={props.eventStore}
        eventUiBases={props.eventUiBases}
        eventSelection={props.eventSelection}
        eventDrag={props.eventDrag}
        eventResize={props.eventResize}
        nextDayThreshold={context.nextDayThreshold}
        colGroupNode={contentArg.tableColGroupNode}
        tableMinWidth={contentArg.tableMinWidth}
        dayMaxEvents={options.dayMaxEvents}
        dayMaxEventRows={options.dayMaxEventRows}
        expandRows={!props.isHeightAuto}
        headerAlignElRef={this.headerElRef}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
      />
    )

    return options.dayMinWidth
      ? this.renderHScrollLayout(headerContent, bodyContent, dayTableModel.colCnt, options.dayMinWidth)
      : this.renderSimpleLayout(headerContent, bodyContent)
  }

}


export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit)
  )
}
