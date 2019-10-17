import {
  htmlToElement,
  appendToElement,
  prependToElement,
  FillRenderer,
  Seg,
  ComponentContext
} from '@fullcalendar/core'
import DayGrid, { DayGridSeg } from './DayGrid'


const EMPTY_CELL_HTML = '<td style="pointer-events:none"></td>'


export default class DayGridFillRenderer extends FillRenderer {

  fillSegTag: string = 'td' // override the default tag name
  dayGrid: DayGrid

  constructor(dayGrid: DayGrid) {
    super()

    this.dayGrid = dayGrid
  }

  renderSegs(type: string, context: ComponentContext, segs: DayGridSeg[]) {

    // don't render timed background events
    if (type === 'bgEvent') {
      segs = segs.filter(function(seg) {
        return seg.eventRange.def.allDay
      })
    }

    super.renderSegs(type, context, segs)
  }

  attachSegs(type, segs: Seg[]) {
    let els = []
    let i
    let seg
    let skeletonEl: HTMLElement

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      skeletonEl = this.renderFillRow(type, seg)
      this.dayGrid.rowEls[seg.row].appendChild(skeletonEl)
      els.push(skeletonEl)
    }

    return els
  }

  // Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
  renderFillRow(type, seg: Seg): HTMLElement {
    let { dayGrid } = this
    let { isRtl } = this.context
    let { colCnt } = dayGrid
    let leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol
    let rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol
    let startCol = leftCol
    let endCol = rightCol + 1
    let className
    let skeletonEl: HTMLElement
    let trEl: HTMLTableRowElement

    if (type === 'businessHours') {
      className = 'bgevent'
    } else {
      className = type.toLowerCase()
    }

    skeletonEl = htmlToElement(
      '<div class="fc-' + className + '-skeleton">' +
        '<table><tr></tr></table>' +
      '</div>'
    )
    trEl = skeletonEl.getElementsByTagName('tr')[0]

    if (startCol > 0) {
      appendToElement(trEl,
        // will create (startCol + 1) td's
        new Array(startCol + 1).join(EMPTY_CELL_HTML)
      )
    }

    (seg.el as HTMLTableCellElement).colSpan = endCol - startCol
    trEl.appendChild(seg.el)

    if (endCol < colCnt) {
      appendToElement(trEl,
        // will create (colCnt - endCol) td's
        new Array(colCnt - endCol + 1).join(EMPTY_CELL_HTML)
      )
    }

    let introHtml = dayGrid.renderProps.renderIntroHtml()
    if (introHtml) {
      if (isRtl) {
        appendToElement(trEl, introHtml)
      } else {
        prependToElement(trEl, introHtml)
      }
    }

    return skeletonEl
  }

}
