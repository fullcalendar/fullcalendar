import {
  DateProfileGenerator, DateProfile,
  ComponentContext,
  DayHeader,
  DaySeries,
  DayTable,
  memoize,
  ViewProps
} from '@fullcalendar/core'
import { SimpleDayGrid } from '@fullcalendar/daygrid'
import SimpleTimeGrid from './SimpleTimeGrid'
import AbstractTimeGridView from './AbstractTimeGridView'


export default class TimeGridView extends AbstractTimeGridView {

  header: DayHeader
  simpleDayGrid: SimpleDayGrid
  simpleTimeGrid: SimpleTimeGrid

  private buildDayTable = memoize(buildDayTable)


  render(props: ViewProps, context: ComponentContext) {
    super.render(props, context) // for flags for updateSize. also _renderSkeleton/_unrenderSkeleton

    let { dateProfile, dateProfileGenerator } = this.props
    let { nextDayThreshold } = context
    let dayTable = this.buildDayTable(dateProfile, dateProfileGenerator)
    let splitProps = this.splitter.splitProps(props)

    if (this.header) {
      this.header.receiveProps({
        dateProfile,
        dates: dayTable.headerDates,
        datesRepDistinctDays: true,
        renderIntroHtml: this.renderHeadIntroHtml
      }, context)
    }

    this.simpleTimeGrid.receiveProps({
      ...splitProps['timed'],
      dateProfile,
      dayTable
    }, context)

    if (this.simpleDayGrid) {
      this.simpleDayGrid.receiveProps({
        ...splitProps['allDay'],
        dateProfile,
        dayTable,
        nextDayThreshold,
        isRigid: false
      }, context)
    }

    this.startNowIndicator(dateProfile, dateProfileGenerator)
  }


  _renderSkeleton(context: ComponentContext) {
    super._renderSkeleton(context)

    if (context.options.columnHeader) {
      this.header = new DayHeader(
        this.el.querySelector('.fc-head-container')
      )
    }

    this.simpleTimeGrid = new SimpleTimeGrid(this.timeGrid)

    if (this.dayGrid) {
      this.simpleDayGrid = new SimpleDayGrid(this.dayGrid)
    }
  }


  _unrenderSkeleton() {
    super._unrenderSkeleton()

    if (this.header) {
      this.header.destroy()
    }

    this.simpleTimeGrid.destroy()

    if (this.simpleDayGrid) {
      this.simpleDayGrid.destroy()
    }
  }


  renderNowIndicator(date) {
    this.simpleTimeGrid.renderNowIndicator(date)
  }

}


export function buildDayTable(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator): DayTable {
  let daySeries = new DaySeries(dateProfile.renderRange, dateProfileGenerator)

  return new DayTable(daySeries, false)
}
