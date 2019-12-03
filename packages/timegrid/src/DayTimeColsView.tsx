import {
  h, createRef,
  DateProfileGenerator, DateProfile,
  ComponentContext,
  DayHeader,
  DaySeries,
  DayTableModel,
  memoize,
  ViewProps
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
      options.allDaySlot &&
        <DayTable
          ref={this.dayTableRef}
          {...splitProps['allDay']}
          dateProfile={dateProfile}
          dayTableModel={dayTableModel}
          nextDayThreshold={nextDayThreshold}
          isRigid={false}
          renderNumberIntro={this.renderTableIntro}
          renderBgIntro={this.renderTableBgIntro}
          renderIntro={this.renderTableIntro}
          colWeekNumbersVisible={false}
          cellWeekNumbersVisible={false}
        />,
      <DayTimeCols
        ref={this.timeColsRef}
        {...splitProps['timed']}
        dateProfile={dateProfile}
        dayTableModel={dayTableModel}
        renderBgIntro={this.renderTimeColsBgIntro}
        renderIntro={this.renderTimeColsIntro}
      />
    )
  }


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {
    let timeCols = this.timeColsRef.current
    let dayTable = this.dayTableRef.current

    if (isResize || this.isLayoutSizeDirty()) {
      this.updateLayoutSize(
        timeCols.timeCols,
        dayTable ? dayTable.table : null,
        viewHeight,
        isAuto
      )
    }

    if (dayTable) {
      dayTable.updateSize(isResize)
    }

    timeCols.updateSize(isResize)
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
