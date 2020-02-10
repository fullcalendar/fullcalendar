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
  ChunkContentCallbackArgs,
} from '@fullcalendar/core'
import TableView, { isEventLimitAuto } from './TableView'
import DayTable from './DayTable'


export default class DayTableView extends TableView { // TODO: use clientWidth/clientHeight

  private buildDayTableModel = memoize(buildDayTableModel)
  private headerRef = createRef<DayHeader>()
  private tableRef = createRef<DayTable>()


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { dateProfile } = props
    let dayTableModel = this.buildDayTableModel(dateProfile, props.dateProfileGenerator)
    let { colWeekNumbersVisible, cellWeekNumbersVisible } = this.processOptions(options)

    return this.renderLayout(
      options.columnHeader &&
        <DayHeader
          ref={this.headerRef}
          dateProfile={dateProfile}
          dates={dayTableModel.headerDates}
          datesRepDistinctDays={dayTableModel.rowCnt === 1}
          renderIntro={this.renderHeadIntro}
        />,
      (contentArg: ChunkContentCallbackArgs) => (
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
          isRigid={isEventLimitAuto(context.options) && !props.isHeightAuto}
          nextDayThreshold={context.nextDayThreshold}
          colGroupNode={contentArg.tableColGroupNode}
          renderNumberIntro={this.renderNumberIntro}
          renderBgIntro={this.renderBgIntro}
          renderIntro={this.renderIntro}
          colWeekNumbersVisible={colWeekNumbersVisible}
          cellWeekNumbersVisible={cellWeekNumbersVisible}
          eventLimit={options.eventLimit}
          vGrow={!props.isHeightAuto}
          headerAlignElRef={this.headerElRef}
          clientWidth={contentArg.clientWidth}
        />
      )
    )
  }

}


export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit)
  )
}
