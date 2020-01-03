import {
  h, createRef,
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

  private buildDayTableModel = memoize(buildDayTableModel)
  private dayTableRef = createRef<DayTable>()
  private timeColsRef = createRef<DayTimeCols>()


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { dateProfile, dateProfileGenerator } = props
    let { nextDayThreshold, options } = context
    let dayTableModel = this.buildDayTableModel(dateProfile, dateProfileGenerator)
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
          ref={this.dayTableRef}
          {...splitProps['allDay']}
          dateProfile={dateProfile}
          dayTableModel={dayTableModel}
          nextDayThreshold={nextDayThreshold}
          colGroupNode={contentArg.colGroupNode}
          isRigid={false}
          renderNumberIntro={this.renderTableIntro}
          renderBgIntro={this.renderTableBgIntro}
          renderIntro={this.renderTableIntro}
          colWeekNumbersVisible={false}
          cellWeekNumbersVisible={false}
        />
      )),
      (contentArg: ChunkContentCallbackArgs) => (
        <DayTimeCols
          ref={this.timeColsRef}
          {...splitProps['timed']}
          dateProfile={dateProfile}
          dayTableModel={dayTableModel}
          colGroupNode={contentArg.colGroupNode}
          renderBgIntro={this.renderTimeColsBgIntro}
          renderIntro={this.renderTimeColsIntro}
        />
      )
    )
  }


  getAllDayTableObj() {
    return this.dayTableRef.current
  }


  getTimeColsObj() {
    return this.timeColsRef.current
  }

}


export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
