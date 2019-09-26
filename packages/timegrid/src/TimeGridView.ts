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

  setContext(context: ComponentContext) {
    super.setContext(context)

    if (context.options.columnHeader) {
      this.header = new DayHeader(
        this.el.querySelector('.fc-head-container')
      )
      this.header.setContext(context)
    }

    this.simpleTimeGrid = new SimpleTimeGrid(this.timeGrid)
    this.simpleTimeGrid.setContext(context)

    if (this.dayGrid) {
      this.simpleDayGrid = new SimpleDayGrid(this.dayGrid)
      this.simpleDayGrid.setContext(context)
    }
  }

  destroy() {
    super.destroy()

    if (this.header) {
      this.header.destroy()
    }

    this.simpleTimeGrid.destroy()

    if (this.simpleDayGrid) {
      this.simpleDayGrid.destroy()
    }
  }

  render(props: ViewProps) {
    super.render(props) // for flags for updateSize

    let { dateProfile, dateProfileGenerator } = this.props
    let { nextDayThreshold } = this.context
    let dayTable = this.buildDayTable(dateProfile, dateProfileGenerator)
    let splitProps = this.splitter.splitProps(props)

    if (this.header) {
      this.header.receiveProps({
        dateProfile,
        dates: dayTable.headerDates,
        datesRepDistinctDays: true,
        renderIntroHtml: this.renderHeadIntroHtml
      })
    }

    this.simpleTimeGrid.receiveProps({
      ...splitProps['timed'],
      dateProfile,
      dayTable
    })

    if (this.simpleDayGrid) {
      this.simpleDayGrid.receiveProps({
        ...splitProps['allDay'],
        dateProfile,
        dayTable,
        nextDayThreshold,
        isRigid: false
      })
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
