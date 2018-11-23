import DateComponent, { Seg } from '../component/DateComponent'
import SimpleDayGridEventRenderer from './SimpleDayGridEventRenderer'
import { htmlEscape } from '../util/html'
import { createFormatter } from '../datelib/formatting'
import { Hit } from '../interactions/HitDragging'
import OffsetTracker from '../common/OffsetTracker'
import { computeRect } from '../util/dom-geom'
import { Rect, pointInsideRect } from '../util/geom'
import { addDays, DateMarker } from '../datelib/marker'
import { removeElement } from '../util/dom-manip'
import { ComponentContext } from '../component/Component'
import { EventInstanceHash } from '../structs/event'
import { memoizeRendering } from '../component/memoized-rendering'

export interface DayTileProps {
  date: DateMarker
  segs: Seg[]
  eventSelection: string
  eventDragInstances: EventInstanceHash
  eventResizeInstances: EventInstanceHash
}

export default class DayTile extends DateComponent<DayTileProps> {

  segContainerEl: HTMLElement
  width: number
  height: number
  offsetTracker: OffsetTracker // TODO: abstraction for tracking dims of whole element rect

  private _renderFrame = memoizeRendering(this.renderFrame)
  private _renderEventSegs = memoizeRendering(this.renderEventSegs, this.unrenderEvents, [ this._renderFrame ])
  private _renderEventSelection = memoizeRendering(this.renderEventSelection, this.unrenderEventSelection, [ this._renderEventSegs ])
  private _renderEventDrag = memoizeRendering(this.renderEventDrag, this.unrenderEventDrag, [ this._renderFrame ])
  private _renderEventResize = memoizeRendering(this.renderEventResize, this.unrenderEventResize, [ this._renderFrame ])

  constructor(context: ComponentContext, el: HTMLElement) {
    super(context, el)

    this.eventRenderer = new DayTileEventRenderer(this)
  }

  render(props: DayTileProps) {
    this._renderFrame(props.date)
    this._renderEventSegs(props.segs)
    this._renderEventSelection(props.eventSelection)
    this._renderEventDrag(props.eventDragInstances)
    this._renderEventResize(props.eventResizeInstances)
  }

  destroy() {
    super.destroy()

    this._renderFrame.unrender() // should unrender everything else
  }

  renderFrame(date: DateMarker) {
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

  renderEventDrag(affectedInstances: EventInstanceHash) {
    if (affectedInstances) {
      this.eventRenderer.hideByHash(affectedInstances)
    }
  }

  unrenderEventDrag(affectedInstances: EventInstanceHash) {
    if (affectedInstances) {
      this.eventRenderer.showByHash(affectedInstances)
    }
  }

  renderEventResize(affectedInstances: EventInstanceHash) {
    if (affectedInstances) {
      this.eventRenderer.hideByHash(affectedInstances)
    }
  }

  unrenderEventResize(affectedInstances: EventInstanceHash) {
    if (affectedInstances) {
      this.eventRenderer.showByHash(affectedInstances)
    }
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

DayTile.prototype.isInteractable = true
DayTile.prototype.useEventCenter = false
