import {
  DateProfileGenerator, DateProfile,
  ComponentContext,
  DayHeader,
  DaySeries,
  DayTableModel,
  memoize,
  ViewProps,
  renderer
} from '@fullcalendar/core'
import { DayTable } from '@fullcalendar/daygrid'
import TimeColsView from './TimeColsView'
import DayTimeCols from './DayTimeCols'


export default class DayTimeColsView extends TimeColsView {

  private buildDayTableModel = memoize(buildDayTableModel)
  private renderDayHeader = renderer(DayHeader)
  private renderDayTable = renderer(DayTable)
  private renderDayTimeCols = renderer(DayTimeCols)

  private allDayTable: DayTable
  private timeCols: DayTimeCols


  render(props: ViewProps, context: ComponentContext) {
    let { dateProfile, dateProfileGenerator } = props
    let { nextDayThreshold } = context
    let dayTableModel = this.buildDayTableModel(dateProfile, dateProfileGenerator)
    let splitProps = this.allDaySplitter.splitProps(props)

    let {
      rootEl,
      headerWrapEl,
      contentWrapEl
    } = this.renderLayout({ type: props.viewSpec.type }, context)

    this.renderDayHeader(headerWrapEl, { // might be null
      dateProfile,
      dates: dayTableModel.headerDates,
      datesRepDistinctDays: true,
      renderIntroHtml: this.renderHeadIntroHtml
    })

    let allDayTable = this.renderDayTable({ parent: contentWrapEl, prepend: true }, { // might be null... TODO: make sure API handles this!!!
      ...splitProps['allDay'],
      dateProfile,
      dayTableModel,
      nextDayThreshold,
      isRigid: false,
      renderProps: this.tableRenderProps
    })

    let timeCols = this.renderDayTimeCols(contentWrapEl, {
      ...splitProps['timed'],
      dateProfile,
      dayTableModel,
      renderProps: this.timeColsRenderProps
    })

    this.startNowIndicator(dateProfile, dateProfileGenerator)

    this.allDayTable = allDayTable
    this.timeCols = timeCols

    return rootEl
  }


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {

    if (isResize || this.isLayoutSizeDirty()) {
      this.updateLayoutSize(
        this.timeCols.timeCols,
        this.allDayTable ? this.allDayTable.table : null,
        viewHeight,
        isAuto
      )
    }

    if (this.allDayTable) {
      this.allDayTable.updateSize(isResize)
    }

    this.timeCols.updateSize(isResize)
  }


  getAllDayTableObj() {
    return this.allDayTable
  }


  getTimeColsObj() {
    return this.timeCols
  }

}


export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
