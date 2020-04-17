import {
  h,
  DateProfileGenerator, DateProfile,
  ComponentContext,
  DayHeader,
  DaySeriesModel,
  DayTableModel,
  memoize,
  ViewProps,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import { DayTable } from '@fullcalendar/daygrid'
import { TimeColsView } from './TimeColsView'
import { DayTimeCols } from './DayTimeCols'
import { buildSlatMetas } from './TimeColsSlats'


export class DayTimeColsView extends TimeColsView {

  private buildTimeColsModel = memoize(buildTimeColsModel)
  private buildSlatMetas = memoize(buildSlatMetas)


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let { options, computedOptions, dateEnv, dateProfile, dateProfileGenerator } = context
    let dayTableModel = this.buildTimeColsModel(dateProfile, dateProfileGenerator)
    let splitProps = this.allDaySplitter.splitProps(props)
    let slatMetas = this.buildSlatMetas(dateProfile.slotMinTime, dateProfile.slotMaxTime, options.slotLabelInterval, computedOptions.slotDuration, dateEnv)
    let { dayMinWidth } = options

    let headerContent = options.dayHeaders &&
      <DayHeader
        dates={dayTableModel.headerDates}
        datesRepDistinctDays={true}
        renderIntro={dayMinWidth ? null : this.renderHeadAxis}
      />

    let allDayContent = options.allDaySlot && ((contentArg: ChunkContentCallbackArgs) => (
      <DayTable
        {...splitProps['allDay']}
        dayTableModel={dayTableModel}
        nextDayThreshold={computedOptions.nextDayThreshold}
        tableMinWidth={contentArg.tableMinWidth}
        colGroupNode={contentArg.tableColGroupNode}
        renderRowIntro={dayMinWidth ? null : this.renderTableRowAxis}
        showWeekNumbers={false}
        expandRows={false}
        headerAlignElRef={this.headerElRef}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
        {...this.getAllDayMaxEventProps()}
      />
    ))

    let timeGridContent = (contentArg: ChunkContentCallbackArgs) => (
      <DayTimeCols
        {...splitProps['timed']}
        dayTableModel={dayTableModel}
        axis={!dayMinWidth}
        slotDuration={computedOptions.slotDuration}
        slatMetas={slatMetas}
        forPrint={props.forPrint}
        tableColGroupNode={contentArg.tableColGroupNode}
        tableMinWidth={contentArg.tableMinWidth}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
        expandRows={contentArg.expandRows}
        onScrollTopRequest={this.handleScrollTopRequest}
      />
    )

    return dayMinWidth
      ? this.renderHScrollLayout(headerContent, allDayContent, timeGridContent, dayTableModel.colCnt, dayMinWidth, slatMetas)
      : this.renderSimpleLayout(headerContent, allDayContent, timeGridContent)
  }

}


export function buildTimeColsModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
