import {
  DateComponent, Seg,
  htmlEscape,
  createFormatter,
  Hit,
  addDays, DateMarker,
  ComponentContext,
  EventInstanceHash,
  renderer,
  DomLocation,
  htmlToElements
} from '@fullcalendar/core'
import DayTileEvents from './DayTileEvents'

export interface DayTileProps extends DomLocation {
  date: DateMarker
  fgSegs: Seg[]
  selectedInstanceId: string
  hiddenInstances: EventInstanceHash
}

export default class DayTile extends DateComponent<DayTileProps> {

  private renderFrame = renderer(renderFrame)
  private renderEvents = renderer(DayTileEvents)


  render(props: DayTileProps) {
    let { rootEls, segContainerEl } = this.renderFrame({
      date: props.date
    })

    this.renderEvents({
      segs: props.fgSegs,
      segContainerEl,
      selectedInstanceId: props.selectedInstanceId,
      hiddenInstances: props.hiddenInstances
    })

    return rootEls
  }


  componentDidMount() {
    let { calendar } = this.context

    calendar.releaseAfterSizingTriggers() // hack for eventPositioned

    // HACK referencing parent's elements.
    // also, if parent's elements change, this will break.
    calendar.registerInteractiveComponent(this, {
      el: this.props.parentEl, // HACK
      useEventCenter: false
    })
  }


  componentWillUnmount() {
    this.context.calendar.unregisterInteractiveComponent(this)
  }


  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit | null {
    let date = this.props.date

    if (positionLeft < elWidth && positionTop < elHeight) {
      return {
        component: this,
        dateSpan: {
          allDay: true,
          range: { start: date, end: addDays(date, 1) }
        },
        dayEl: this.props.parentEl, // HACK
        rect: {
          left: 0,
          top: 0,
          right: elWidth,
          bottom: elHeight
        },
        layer: 1
      }
    }
  }

}


function renderFrame(props: { date: DateMarker }, context: ComponentContext) {
  let { theme, dateEnv, options } = context

  let title = dateEnv.format(
    props.date,
    createFormatter(options.dayPopoverFormat) // TODO: cache
  )

  let els = htmlToElements(
    '<div class="fc-header ' + theme.getClass('popoverHeader') + '">' +
      '<span class="fc-title">' +
        htmlEscape(title) +
      '</span>' +
      '<span class="fc-close ' + theme.getIconClass('close') + '"></span>' +
    '</div>' +
    '<div class="fc-body ' + theme.getClass('popoverContent') + '">' +
      '<div class="fc-event-container"></div>' +
    '</div>'
  )

  return {
    rootEls: els,
    segContainerEl: els[1].querySelector('.fc-event-container') as HTMLElement
  }
}
