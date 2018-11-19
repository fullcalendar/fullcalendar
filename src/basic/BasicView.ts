import AbstractBasicView from './AbstractBasicView'
import DayHeader from '../common/DayHeader'
import SimpleDayGrid from './SimpleDayGrid'
import { ComponentContext } from '../component/Component'
import { ViewSpec } from '../structs/view-spec'
import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { ViewProps } from '../View'
import reselector from '../util/reselector'
import DaySeries from '../common/DaySeries'
import DayTable from '../common/DayTable'

export default class BasicView extends AbstractBasicView {

  header: DayHeader
  simpleDayGrid: SimpleDayGrid
  dayTable: DayTable

  buildDayTable = reselector(buildDayTable)

  constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement) {
    super(context, viewSpec, dateProfileGenerator, parentEl)

    if (this.opt('columnHeader')) {
      this.header = new DayHeader(
        this.context,
        this.el.querySelector('.fc-head-container')
      )
    }

    this.simpleDayGrid = new SimpleDayGrid(context, this.dayGrid)
  }

  destroy() {
    super.destroy()

    if (this.header) {
      this.header.destroy()
    }
  }

  render(props: ViewProps) {
    super.render(props)

    let { dateProfile } = this.props

    let dayTable = this.dayTable =
      this.buildDayTable(dateProfile, this.dateProfileGenerator)

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
      eventUis: props.eventUis,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      isRigid: this.hasRigidRows(),
      nextDayThreshold: this.nextDayThreshold
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
