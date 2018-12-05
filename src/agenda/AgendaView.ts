import AbstractAgendaView from './AbstractAgendaView'
import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { ComponentContext } from '../component/Component'
import { ViewSpec } from '../structs/view-spec'
import DayHeader from '../common/DayHeader'
import DaySeries from '../common/DaySeries'
import DayTable from '../common/DayTable'
import SimpleTimeGrid from './SimpleTimeGrid'
import SimpleDayGrid from '../basic/SimpleDayGrid'
import reselector from '../util/reselector'
import { ViewProps } from '../View'


export default class AgendaView extends AbstractAgendaView {

  header: DayHeader
  simpleDayGrid: SimpleDayGrid
  simpleTimeGrid: SimpleTimeGrid

  private buildDayTable = reselector(buildDayTable)

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

    let { splitter } = this
    let { dateProfile, dateSelection } = this.props
    let dayTable = this.buildDayTable(dateProfile, this.dateProfileGenerator)

    let eventStores = splitter.splitEventStore(props.eventStore)
    let eventDrags = splitter.splitEventDrag(props.eventDrag)
    let eventResizes = splitter.splitEventResize(props.eventResize)

    if (this.header) {
      this.header.receiveProps({
        dateProfile,
        dates: dayTable.headerDates,
        datesRepDistinctDays: true,
        renderIntroHtml: this.renderHeadIntroHtml
      })
    }

    this.simpleTimeGrid.receiveProps({
      dateProfile,
      dayTable,
      businessHours: props.businessHours,
      dateSelection: dateSelection && !dateSelection.allDay ? dateSelection : null,
      eventStore: eventStores.timed,
      eventUiBases: props.eventUiBases,
      eventUiBySource: props.eventUiBySource,
      eventSelection: props.eventSelection,
      eventDrag: eventDrags.timed,
      eventResize: eventResizes.timed
    })

    if (this.simpleDayGrid) {
      this.simpleDayGrid.receiveProps({
        dateProfile,
        dayTable,
        businessHours: props.businessHours,
        dateSelection: dateSelection && dateSelection.allDay ? dateSelection : null,
        eventStore: eventStores.allDay,
        eventUiBases: props.eventUiBases,
        eventUiBySource: props.eventUiBySource,
        eventSelection: props.eventSelection,
        eventDrag: eventDrags.allDay,
        eventResize: eventResizes.allDay,
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
