import {
  DayHeader,
  ComponentContext,
  DateProfileGenerator,
  DateProfile,
  ViewProps,
  memoize,
  DaySeries,
  DayTableModel,
} from '@fullcalendar/core'
import TableView, { hasRigidRows } from './TableView'
import DayTable from './DayTable'
import { h, createRef } from 'preact'


export default class DayTableView extends TableView {

  private buildDayTableModel = memoize(buildDayTableModel)
  private headerRef = createRef<DayHeader>()
  private tableRef = createRef<DayTable>()


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { dateProfile } = props
    let dayTableModel = this.buildDayTableModel(dateProfile, props.dateProfileGenerator)
    let { colWeekNumbersVisible, cellWeekNumbersVisible } = this.processOptions(context.options)

    return this.renderLayout(
      <DayHeader
        ref={this.headerRef}
        dateProfile={dateProfile}
        dates={dayTableModel.headerDates}
        datesRepDistinctDays={dayTableModel.rowCnt === 1}
        renderIntro={this.renderHeadIntro}
      />,
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
        isRigid={hasRigidRows(context.options)}
        nextDayThreshold={context.nextDayThreshold}
        renderNumberIntro={this.renderNumberIntro}
        renderBgIntro={this.renderBgIntro}
        renderIntro={this.renderIntro}
        colWeekNumbersVisible={colWeekNumbersVisible}
        cellWeekNumbersVisible={cellWeekNumbersVisible}
      />
    )
  }


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {
    let header = this.headerRef.current
    let table = this.tableRef.current

    if (isResize || this.isLayoutSizeDirty()) {
      this.updateLayoutHeight(
        header ? header.rootEl : null,
        table.table,
        viewHeight,
        isAuto
      )
    }

    table.updateSize(isResize)
  }

}


export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit)
  )
}
