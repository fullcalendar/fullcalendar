import {
  h, createRef,
  DateComponent, Seg,
  Hit,
  addDays, DateMarker,
  EventInstanceHash,
  subrenderer,
  elementClosest
} from '@fullcalendar/core'
import DayTileEvents from './DayTileEvents'


export interface DayTileProps {
  date: DateMarker
  fgSegs: Seg[]
  selectedInstanceId: string
  hiddenInstances: EventInstanceHash
}

export default class DayTile extends DateComponent<DayTileProps> {

  private renderEvents = subrenderer(DayTileEvents)
  private rootElRef = createRef<HTMLDivElement>()
  private popoverEl: HTMLElement // HACK. contains this component


  render() {
    return (
      <div class='fc-event-container' ref={this.rootElRef} />
    )
  }


  componentDidMount() {
    let rootEl = this.rootElRef.current
    let popoverEl = this.popoverEl = elementClosest(rootEl, '.fc-popover')

    this.subrender()

    // HACK referencing parent's elements.
    // also, if parent's elements change, this will break.
    this.context.calendar.registerInteractiveComponent(this, {
      el: popoverEl,
      useEventCenter: false
    })
  }


  componentDidUpdate() {
    this.subrender()
  }


  componentWillUnmount() {
    this.context.calendar.unregisterInteractiveComponent(this)
    this.subrenderDestroy()
  }


  subrender() {
    let { props } = this
    let rootEl = this.rootElRef.current

    this.renderEvents({
      segs: props.fgSegs,
      segContainerEl: rootEl,
      selectedInstanceId: props.selectedInstanceId,
      hiddenInstances: props.hiddenInstances,
      isDragging: false,
      isResizing: false,
      isSelecting: false
    })

    this.context.calendar.releaseAfterSizingTriggers() // hack for eventPositioned
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
        dayEl: this.popoverEl,
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


  isPopover() {
    return true // HACK for hit system
  }

}
