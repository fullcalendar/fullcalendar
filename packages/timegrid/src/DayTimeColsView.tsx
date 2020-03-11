import {
  h,
  DateProfileGenerator, DateProfile,
  ComponentContext,
  DayHeader,
  DaySeries,
  DayTableModel,
  memoize,
  ViewProps,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import { DayTable } from '@fullcalendar/daygrid'
import TimeColsView from './TimeColsView'
import DayTimeCols from './DayTimeCols'


export default class DayTimeColsView extends TimeColsView {

  private buildTimeColsModel = memoize(buildTimeColsModel)


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { dateProfile, dateProfileGenerator } = props
    let { nextDayThreshold, options } = context
    let dayTableModel = this.buildTimeColsModel(dateProfile, dateProfileGenerator)
    let splitProps = this.allDaySplitter.splitProps(props)

    return this.renderLayout(
      options.columnHeader &&
        <DayHeader
          dateProfile={dateProfile}
          dates={dayTableModel.headerDates}
          datesRepDistinctDays={true}
          renderIntro={this.renderHeadIntro}
        />,
      options.allDaySlot && ((contentArg: ChunkContentCallbackArgs) => (
        <DayTable
          {...splitProps['allDay']}
          dateProfile={dateProfile}
          dayTableModel={dayTableModel}
          nextDayThreshold={nextDayThreshold}
          colGroupNode={contentArg.tableColGroupNode}
          renderRowIntro={this.renderTableRowIntro}
          eventLimit={this.getAllDayEventLimit()}
          vGrowRows={false}
          headerAlignElRef={this.headerElRef}
          clientWidth={contentArg.clientWidth}
          clientHeight={contentArg.clientHeight}
        />
      )),
      (contentArg: ChunkContentCallbackArgs) => (
        <DayTimeCols
          {...splitProps['timed']}
          dateProfile={dateProfile}
          dayTableModel={dayTableModel}
          forPrint={props.forPrint}
          tableColGroupNode={contentArg.tableColGroupNode}
          tableMinWidth={contentArg.tableMinWidth}
          clientWidth={contentArg.clientWidth}
          clientHeight={contentArg.clientHeight}
          vGrowRows={contentArg.vGrowRows}
          onScrollTopRequest={this.handleScrollTopRequest}
        />
      )
    )
  }

}


export function buildTimeColsModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
