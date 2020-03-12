import {
  h,
  DateProfileGenerator, DateProfile,
  ComponentContext,
  DayHeader,
  DaySeries,
  DayTableModel,
  memoize,
  ViewProps,
  ChunkContentCallbackArgs,
  createDuration
} from '@fullcalendar/core'
import { DayTable } from '@fullcalendar/daygrid'
import TimeColsView from './TimeColsView'
import DayTimeCols from './DayTimeCols'
import { buildSlatMetas } from './TimeColsSlats'


export default class DayTimeColsView extends TimeColsView {

  private buildTimeColsModel = memoize(buildTimeColsModel)
  private parseSlotDuration = memoize(createDuration)
  private buildSlatMetas = memoize(buildSlatMetas)


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { dateProfile, dateProfileGenerator } = props
    let { nextDayThreshold, options, dateEnv } = context
    let dayTableModel = this.buildTimeColsModel(dateProfile, dateProfileGenerator)
    let splitProps = this.allDaySplitter.splitProps(props)
    let slotDuration = this.parseSlotDuration(options.slotDuration)
    let slatMetas = this.buildSlatMetas(dateProfile, options.slotLabelInterval, slotDuration, dateEnv)
    let { columnMinWidth } = options

    let headerContent = options.columnHeader &&
      <DayHeader
        dateProfile={dateProfile}
        dates={dayTableModel.headerDates}
        datesRepDistinctDays={true}
        renderIntro={columnMinWidth ? null : this.renderHeadAxis}
      />

    let allDayContent = options.allDaySlot && ((contentArg: ChunkContentCallbackArgs) => (
      <DayTable
        {...splitProps['allDay']}
        dateProfile={dateProfile}
        dayTableModel={dayTableModel}
        nextDayThreshold={nextDayThreshold}
        tableMinWidth={contentArg.tableMinWidth}
        colGroupNode={contentArg.tableColGroupNode}
        renderRowIntro={columnMinWidth ? null : this.renderTableRowAxis}
        eventLimit={this.getAllDayEventLimit()}
        vGrowRows={false}
        headerAlignElRef={this.headerElRef}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
      />
    ))

    let timeGridContent = (contentArg: ChunkContentCallbackArgs) => (
      <DayTimeCols
        {...splitProps['timed']}
        dateProfile={dateProfile}
        dayTableModel={dayTableModel}
        axis={!columnMinWidth}
        slotDuration={slotDuration}
        slatMetas={slatMetas}
        forPrint={props.forPrint}
        tableColGroupNode={contentArg.tableColGroupNode}
        tableMinWidth={contentArg.tableMinWidth}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
        vGrowRows={contentArg.vGrowRows}
        onScrollTopRequest={this.handleScrollTopRequest}
      />
    )

    return columnMinWidth
      ? this.renderHScrollLayout(headerContent, allDayContent, timeGridContent, dayTableModel.colCnt, columnMinWidth, slatMetas)
      : this.renderSimpleLayout(headerContent, allDayContent, timeGridContent)
  }

}


export function buildTimeColsModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
