import { Seg } from '../component/DateComponent'
import SimpleDayGridEventRenderer from './SimpleDayGridEventRenderer'
import { htmlEscape } from '../util/html'
import { createFormatter } from '../datelib/formatting'
import { Hit } from '../interactions/HitDragging'
import OffsetTracker from '../common/OffsetTracker'
import { computeRect } from '../util/dom-geom'
import { Rect, pointInsideRect } from '../util/geom'
import { addDays, DateMarker } from '../datelib/marker'
import { removeElement } from '../util/dom-manip'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { ComponentContext } from '../component/Component'
import StandardDateComponent from '../component/StandardDateComponent'

/*
props:
- date
- segs
- eventSelection
- eventDrag
- eventResize
*/
export default class DayTile extends StandardDateComponent {

  segContainerEl: HTMLElement
  width: number
  height: number
  offsetTracker: OffsetTracker // TODO: abstraction for tracking dims of whole element rect


  constructor(context: ComponentContext, el: HTMLElement) {
    super(context, el)

    this.eventRenderer = new DayTileEventRenderer(this)
  }


  render(props) {
    let dateId = this.subrender('renderFrame', [ props.date ])
    let evId = this.subrender('renderCoolSegs', [ props.segs ], 'unrenderCoolSegs')
    this.subrender('renderEventSelection', [ props.eventSelection, evId ], 'unrenderEventSelection')
    this.subrender('renderEventDragState', [ props.eventDrag, dateId ], 'unrenderEventDragState')
    this.subrender('renderEventResizeState', [ props.eventResize, dateId ], 'unrenderEventResizeState')
  }

  // needed to be a different name :/
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

  // needed to be a different name :/
  renderCoolSegs(segs: Seg[]) {
    this.eventRenderer.renderSegs(segs)
  }

  // needed to be a different name :/
  unrenderCoolSegs(segs: Seg[]) {
    this.eventRenderer.unrender()
  }

  renderEventDragState(state: EventInteractionUiState) {
    if (state) {
      this.eventRenderer.hideByHash(state.affectedEvents.instances)
    }
  }

  unrenderEventDragState(state: EventInteractionUiState) {
    if (state) {
      this.eventRenderer.showByHash(state.affectedEvents.instances)
    }
  }

  renderEventResizeState(state: EventInteractionUiState) {
    if (state) {
      this.eventRenderer.hideByHash(state.affectedEvents.instances)
    }
  }

  unrenderEventResizeState(state: EventInteractionUiState) {
    if (state) {
      this.eventRenderer.showByHash(state.affectedEvents.instances)
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
