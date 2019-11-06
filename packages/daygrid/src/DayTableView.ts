import {
  DayHeader,
  ComponentContext,
  DateProfileGenerator,
  DateProfile,
  ViewProps,
  memoize,
  DaySeries,
  DayTableModel,
  renderer
} from '@fullcalendar/core'
import TableView, { hasRigidRows } from './TableView'
import DayTable from './DayTable'


export default class DayTableView extends TableView {

  private buildDayTableModel = memoize(buildDayTableModel)
  private renderHeader = renderer(DayHeader)
  private renderTable = renderer(DayTable)

  private header: DayHeader | null
  private table: DayTable


  render(props: ViewProps, context: ComponentContext) {
    let { dateProfile } = props
    let dayTableModel = this.buildDayTableModel(dateProfile, props.dateProfileGenerator)

    let { rootEl, headerWrapEl, contentWrapEl } = this.renderLayout({
      type: props.viewSpec.type
    }, context)

    this.header = this.renderHeader({
      parentEl: headerWrapEl, // might be null
      dateProfile,
      dates: dayTableModel.headerDates,
      datesRepDistinctDays: dayTableModel.rowCnt === 1,
      renderIntroHtml: this.renderHeadIntroHtml
    })

    this.table = this.renderTable({
      parentEl: contentWrapEl,
      renderProps: this.tableRenderProps,
      dateProfile,
      dayTableModel,
      businessHours: props.businessHours,
      dateSelection: props.dateSelection,
      eventStore: props.eventStore,
      eventUiBases: props.eventUiBases,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      isRigid: hasRigidRows(context.options),
      nextDayThreshold: context.nextDayThreshold
    })

    return rootEl
  }


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {

    if (this.isLayoutSizeDirty()) {
      this.updateLayoutHeight(
        this.header ? this.header.rootEl : null,
        this.table.table,
        viewHeight,
        isAuto,
        this.context.options
      )
    }

    this.table.updateSize(isResize)
  }

}


export function buildDayTableModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit)
  )
}
