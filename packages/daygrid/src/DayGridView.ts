import {
  DayHeader,
  ComponentContext,
  DateProfileGenerator,
  DateProfile,
  ViewProps,
  memoize,
  DaySeries,
  DayTable
} from '@fullcalendar/core'
import AbstractDayGridView from './AbstractDayGridView'
import SimpleDayGrid from './SimpleDayGrid'

export default class DayGridView extends AbstractDayGridView {

  header: DayHeader
  simpleDayGrid: SimpleDayGrid
  dayTable: DayTable

  private buildDayTable = memoize(buildDayTable)

  setContext(context: ComponentContext) {
    super.setContext(context)

    if (context.options.columnHeader) {
      this.header = new DayHeader(
        this.el.querySelector('.fc-head-container')
      )
      this.header.setContext(context)
    }

    this.simpleDayGrid = new SimpleDayGrid(this.dayGrid)
    this.simpleDayGrid.setContext(context)
  }

  destroy() {
    super.destroy()

    if (this.header) {
      this.header.destroy()
    }

    this.simpleDayGrid.destroy()
  }

  render(props: ViewProps) {
    super.render(props)

    let { dateProfile } = this.props

    let dayTable = this.dayTable =
      this.buildDayTable(dateProfile, props.dateProfileGenerator)

    if (this.header) {
      this.header.receiveProps({
        dateProfile,
        dates: dayTable.headerDates,
        datesRepDistinctDays: dayTable.rowCnt === 1,
        renderIntroHtml: this.renderHeadIntroHtml
      })
    }

    this.simpleDayGrid.receiveProps({
      dateProfile,
      dayTable,
      businessHours: props.businessHours,
      dateSelection: props.dateSelection,
      eventStore: props.eventStore,
      eventUiBases: props.eventUiBases,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      isRigid: this.hasRigidRows(),
      nextDayThreshold: this.context.nextDayThreshold
    })
  }

}

export function buildDayTable(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTable(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit)
  )
}
