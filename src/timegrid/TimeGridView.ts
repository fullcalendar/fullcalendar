import {
  DateProfileGenerator, DateProfile,
  ComponentContext,
  ViewSpec,
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

  constructor(
    _context: ComponentContext,
    viewSpec: ViewSpec,
    dateProfileGenerator: DateProfileGenerator,
    parentEl: HTMLElement
  ) {
    super(_context, viewSpec, dateProfileGenerator, parentEl)

    if (this.opt('columnHeader')) {
      this.header = new DayHeader(
        this.context,
        this.el.querySelector('.fc-head-container')
      )
    }

    this.simpleTimeGrid = new SimpleTimeGrid(this.context, this.timeGrid)

    if (this.dayGrid) {
      this.simpleDayGrid = new SimpleDayGrid(this.context, this.dayGrid)
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

    let { dateProfile } = this.props
    let dayTable = this.buildDayTable(dateProfile, this.dateProfileGenerator)
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
        nextDayThreshold: this.nextDayThreshold,
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
