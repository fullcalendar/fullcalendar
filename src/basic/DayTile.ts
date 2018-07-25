import DateComponent from '../component/DateComponent'
import EventRenderer from '../component/renderers/EventRenderer'
import DayGridEventRenderer from './DayGridEventRenderer'
import { htmlEscape } from '../util/html'
import { createFormatter } from '../datelib/formatting'
import { Seg } from '../component/DateComponent'

export default class DayTile extends DateComponent {

  isInteractable = true
  date: Date
  segContainerEl: HTMLElement

  constructor(component, date) {
    super(component)
    this.date = date
  }

  renderSkeleton() {
    let theme = this.getTheme()
    let dateEnv = this.getDateEnv()
    let title = dateEnv.format(
      this.date,
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

}

export class DayTileEventRenderer extends EventRenderer {

  renderFgSegs(segs: Seg[]) {
    for (let seg of segs) {
      this.component.segContainerEl.appendChild(seg.el)
    }
  }

  isEventDefResizableFromStart(eventDef) {
    return false
  }

  isEventDefResizableFromEnd(eventDef) {
    return false
  }

}

// hack
DayTileEventRenderer.prototype.fgSegHtml = DayGridEventRenderer.prototype.fgSegHtml

DayTile.prototype.eventRendererClass = DayTileEventRenderer
