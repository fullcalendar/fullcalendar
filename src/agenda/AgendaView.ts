import AbstractAgendaView from './AbstractAgendaView'
import TimeGrid from './TimeGrid'
import DayGrid from '../basic/DayGrid'
import DateProfileGenerator, { DateProfile } from '../DateProfileGenerator'
import { ComponentContext } from '../component/Component'
import { ViewSpec } from '../structs/view-spec'
import DayHeader from '../common/DayHeader'
import { StandardDateComponentProps } from '../component/StandardDateComponent'
import { assignTo } from '../util/object'
import reselector from '../util/reselector'
import DayGridSlicer from '../basic/DayGridSlicer'
import TimeGridSlicer from './TimeGridSlicer'
import DayTable from '../common/DayTable'
import DaySeries from '../common/DaySeries'


export default class AgendaView extends AbstractAgendaView {

  header: DayHeader

  constructor(
    context: ComponentContext,
    viewSpec: ViewSpec,
    dateProfileGenerator: DateProfileGenerator,
    parentEl: HTMLElement
  ) {
    super(context, viewSpec, dateProfileGenerator, parentEl, TimeGrid, DayGrid)

    if (this.opt('columnHeader')) {
      this.header = new DayHeader(
        this.context,
        this.el.querySelector('.fc-head-container')
      )
    }
  }

  destroy() {
    super.destroy()

    if (this.header) {
      this.header.destroy()
    }
  }

  render(props: StandardDateComponentProps) {
    super.render(props)

    let allDaySeletion = null
    let timedSelection = null

    if (props.dateSelection) {
      if (props.dateSelection.allDay) {
        allDaySeletion = props.dateSelection
      } else {
        timedSelection = props.dateSelection
      }
    }

    let timeGridSlicer = this.buildTimeGridSlicer(props.dateProfile)

    if (this.header) {
      this.header.receiveProps({
        dateProfile: props.dateProfile,
        dates: timeGridSlicer.daySeries.dates,
        datesRepDistinctDays: true,
        renderIntroHtml: this.renderHeadIntroHtml
      })
    }

    this.timeGrid.receiveProps(
      assignTo({}, props, {
        eventStore: this.filterEventsForTimeGrid(props.eventStore, props.eventUis),
        dateSelection: timedSelection,
        eventDrag: this.buildEventDragForTimeGrid(props.eventDrag),
        eventResize: this.buildEventResizeForTimeGrid(props.eventResize),
        slicer: timeGridSlicer
      })
    )

    if (this.dayGrid) {
      this.dayGrid.receiveProps(
        assignTo({}, props, {
          eventStore: this.filterEventsForDayGrid(props.eventStore, props.eventUis),
          dateSelection: allDaySeletion,
          eventDrag: this.buildEventDragForDayGrid(props.eventDrag),
          eventResize: this.buildEventResizeForDayGrid(props.eventResize),
          slicer: this.buildDayGridSlicer(props.dateProfile)
        })
      )
    }
  }

  buildDayGridSlicer = reselector(function(this: AgendaView, dateProfile: DateProfile) {
    return new DayGridSlicer(
      new DayTable(
        new DaySeries(this.props.dateProfile.renderRange, this.dateProfileGenerator), // TODO: reuse!!!
        false // breakOnWeeks
      ),
      this.isRtl
    )
  })

  buildTimeGridSlicer = reselector(function(this: AgendaView, dateProfile) {
    return new TimeGridSlicer(
      dateProfile,
      this.dateProfileGenerator,
      this.dateEnv
    )
  })

}
