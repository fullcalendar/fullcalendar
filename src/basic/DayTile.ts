import {
  DateComponent, Seg,
  htmlEscape,
  createFormatter,
  Hit,
  OffsetTracker,
  computeRect,
  Rect, pointInsideRect,
  addDays, DateMarker,
  removeElement,
  ComponentContext,
  EventInstanceHash,
  memoizeRendering, MemoizedRendering
} from 'fullcalendar'
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
  width: number
  height: number
  offsetTracker: OffsetTracker // TODO: abstraction for tracking dims of whole element rect

  private renderFrame: MemoizedRendering<[DateMarker]>
  private renderFgEvents: MemoizedRendering<[Seg[]]>
  private renderEventSelection: MemoizedRendering<[string]>
  private renderEventDrag: MemoizedRendering<[EventInstanceHash]>
  private renderEventResize: MemoizedRendering<[EventInstanceHash]>

  constructor(context: ComponentContext, el: HTMLElement) {
    super(context, el)

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

  render(props: DayTileProps) {
    this.renderFrame(props.date)
    this.renderFgEvents(props.fgSegs)
    this.renderEventSelection(props.eventSelection)
    this.renderEventDrag(props.eventDragInstances)
    this.renderEventResize(props.eventResizeInstances)
  }

  destroy() {
    super.destroy()

    this.renderFrame.unrender() // should unrender everything else
  }

  _renderFrame(date: DateMarker) {
    let { theme, dateEnv } = this

    let title = dateEnv.format(
      date,
      createFormatter(this.opt('dayPopoverFormat')) // TODO: cache
    )

    this.el.innerHTML =
      '<div class="fc-header ' + theme.getClass('popoverHeader') + '">' +
        '<span class="fc-close ' + theme.getIconClass('close') + '"></span>' +
        '<span class="fc-title">' +
          htmlEscape(title) +
        '</span>' +
        '<div class="fc-clear"></div>' +
      '</div>' +
      '<div class="fc-body ' + theme.getClass('popoverContent') + '">' +
        '<div class="fc-event-container"></div>' +
      '</div>'

    this.segContainerEl = this.el.querySelector('.fc-event-container')
  }

  prepareHits() {
    let rect = computeRect(this.el)
    this.width = rect.right - rect.left
    this.height = rect.bottom - rect.top
    this.offsetTracker = new OffsetTracker(this.el)
  }

  releaseHits() {
    this.offsetTracker.destroy()
  }

  queryHit(leftOffset, topOffset): Hit | null {
    let rectLeft = this.offsetTracker.computeLeft()
    let rectTop = this.offsetTracker.computeTop()
    let rect: Rect = {
      left: rectLeft,
      right: rectLeft + this.width,
      top: rectTop,
      bottom: rectTop + this.height
    }

    if (pointInsideRect({ left: leftOffset, top: topOffset }, rect)) {
      let date = (this.props as any).date // HACK

      return {
        component: this,
        dateSpan: {
          allDay: true,
          range: { start: date, end: addDays(date, 1) }
        },
        dayEl: this.el,
        rect: rect,
        layer: 1
      }
    }

    return null
  }

}

DayTile.prototype.isInteractable = true
DayTile.prototype.useEventCenter = false


export class DayTileEventRenderer extends SimpleDayGridEventRenderer {

  dayTile: DayTile

  constructor(dayTile) {
    super(dayTile.context)

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
