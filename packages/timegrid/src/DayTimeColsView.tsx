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
          isRigid={false}
          renderNumberIntro={this.renderTableIntro}
          renderBgIntro={this.renderTableBgIntro}
          renderIntro={this.renderTableIntro}
          colWeekNumbersVisible={false}
          cellWeekNumbersVisible={false}
          eventLimit={this.getAllDayEventLimit()}
          vGrow={false}
        />
      )),
      (contentArg: ChunkContentCallbackArgs) => (
        <DayTimeCols
          {...splitProps['timed']}
          dateProfile={dateProfile}
          dayTableModel={dayTableModel}
          renderBgIntro={this.renderTimeColsBgIntro}
          renderIntro={this.renderTimeColsIntro}
          forPrint={props.forPrint}
          tableColGroupNode={contentArg.tableColGroupNode}
          tableMinWidth={contentArg.tableMinWidth}
          clientWidth={contentArg.clientWidth}
          clientHeight={contentArg.clientHeight}
          onScrollTop={this.handleScrollTop}
        />
      )
    )
  }

}


export function buildTimeColsModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
