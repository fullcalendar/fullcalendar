import {
  DateComponent, Seg,
  htmlEscape,
  createFormatter,
  Hit,
  addDays, DateMarker,
  removeElement,
  ComponentContext,
  EventInstanceHash,
  memoizeRendering, MemoizedRendering
} from '@fullcalendar/core'
import SimpleDayGridEventRenderer from './SimpleDayGridEventRenderer'

export interface DayTileProps {
  date: DateMarker
  fgSegs: Seg[]
  eventSelection: string
  eventDragInstances: EventInstanceHash
  eventResizeInstances: EventInstanceHash
}

export default class DayTile extends DateComponent<DayTileProps> {

  segContainerEl: HTMLElement

  private renderFrame: MemoizedRendering<[DateMarker]>
  private renderFgEvents: MemoizedRendering<[ComponentContext, Seg[]]>
  private renderEventSelection: MemoizedRendering<[string]>
  private renderEventDrag: MemoizedRendering<[EventInstanceHash]>
  private renderEventResize: MemoizedRendering<[EventInstanceHash]>


  constructor(el: HTMLElement) {
    super(el)

    let eventRenderer = this.eventRenderer = new DayTileEventRenderer(this)

    let renderFrame = this.renderFrame = memoizeRendering(
      this._renderFrame
    )

    this.renderFgEvents = memoizeRendering(
      eventRenderer.renderSegs.bind(eventRenderer),
      eventRenderer.unrender.bind(eventRenderer),
      [ renderFrame ]
    )

    this.renderEventSelection = memoizeRendering(
      eventRenderer.selectByInstanceId.bind(eventRenderer),
      eventRenderer.unselectByInstanceId.bind(eventRenderer),
      [ this.renderFgEvents ]
    )

    this.renderEventDrag = memoizeRendering(
      eventRenderer.hideByHash.bind(eventRenderer),
      eventRenderer.showByHash.bind(eventRenderer),
      [ renderFrame ]
    )

    this.renderEventResize = memoizeRendering(
      eventRenderer.hideByHash.bind(eventRenderer),
      eventRenderer.showByHash.bind(eventRenderer),
      [ renderFrame ]
    )
  }


  firstContext(context: ComponentContext) {
    context.calendar.registerInteractiveComponent(this, {
      el: this.el,
      useEventCenter: false
    })
  }


  render(props: DayTileProps, context: ComponentContext) {
    this.renderFrame(props.date)
    this.renderFgEvents(context, props.fgSegs)
    this.renderEventSelection(props.eventSelection)
    this.renderEventDrag(props.eventDragInstances)
    this.renderEventResize(props.eventResizeInstances)
  }


  destroy() {
    super.destroy()

    this.renderFrame.unrender() // should unrender everything else

    this.context.calendar.unregisterInteractiveComponent(this)
  }


  _renderFrame(date: DateMarker) {
    let { theme, dateEnv, options } = this.context

    let title = dateEnv.format(
      date,
      createFormatter(options.dayPopoverFormat) // TODO: cache
    )

    this.el.innerHTML =
      '<div class="fc-header ' + theme.getClass('popoverHeader') + '">' +
        '<span class="fc-title">' +
          htmlEscape(title) +
        '</span>' +
        '<span class="fc-close ' + theme.getIconClass('close') + '"></span>' +
      '</div>' +
      '<div class="fc-body ' + theme.getClass('popoverContent') + '">' +
        '<div class="fc-event-container"></div>' +
      '</div>'

    this.segContainerEl = this.el.querySelector('.fc-event-container')
  }


  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit | null {
    let date = (this.props as any).date // HACK

    if (positionLeft < elWidth && positionTop < elHeight) {
      return {
        component: this,
        dateSpan: {
          allDay: true,
          range: { start: date, end: addDays(date, 1) }
        },
        dayEl: this.el,
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


export class DayTileEventRenderer extends SimpleDayGridEventRenderer {

  dayTile: DayTile

  constructor(dayTile) {
    super()

    this.dayTile = dayTile
  }

  attachSegs(segs: Seg[]) {
    for (let seg of segs) {
      this.dayTile.segContainerEl.appendChild(seg.el)
    }
  }

  detachSegs(segs: Seg[]) {
    for (let seg of segs) {
      removeElement(seg.el)
    }
  }

}
