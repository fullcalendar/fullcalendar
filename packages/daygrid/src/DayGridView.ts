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


  render(props: ViewProps, context: ComponentContext) {
    super.render(props, context) // will call _renderSkeleton/_unrenderSkeleton

    let { dateProfile } = this.props

    let dayTable = this.dayTable =
      this.buildDayTable(dateProfile, props.dateProfileGenerator)

    if (this.header) {
      this.header.receiveProps({
        dateProfile,
        dates: dayTable.headerDates,
        datesRepDistinctDays: dayTable.rowCnt === 1,
        renderIntroHtml: this.renderHeadIntroHtml
      }, context)
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
    }, context)
  }


  _renderSkeleton(context: ComponentContext) {
    super._renderSkeleton(context)

    if (context.options.columnHeader) {
      this.header = new DayHeader(
        this.el.querySelector('.fc-head-container')
      )
    }

    this.simpleDayGrid = new SimpleDayGrid(this.dayGrid)
  }


  _unrenderSkeleton() {
    super._unrenderSkeleton()

    if (this.header) {
      this.header.destroy()
    }

    this.simpleDayGrid.destroy()
  }

}

export function buildDayTable(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTable(
    daySeries,
    /year|month|week/.test(dateProfile.currentRangeUnit)
  )
}
