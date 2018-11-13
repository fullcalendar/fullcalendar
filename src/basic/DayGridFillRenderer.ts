import { htmlToElement, createElement, appendToElement, prependToElement } from '../util/dom-manip'
import FillRenderer from '../component/renderers/FillRenderer'
import DayGrid from './DayGrid'
import { Seg } from '../component/DateComponent'


export default class DayGridFillRenderer extends FillRenderer {

  fillSegTag: string = 'td' // override the default tag name
  dayGrid: DayGrid

  constructor(dayGrid: DayGrid) {
    super(dayGrid.context)

    this.dayGrid = dayGrid
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
    let colCnt = dayGrid.colCnt
    let startCol = seg.leftCol
    let endCol = seg.rightCol + 1
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
      trEl.appendChild(createElement('td', { colSpan: startCol }))
    }

    (seg.el as HTMLTableCellElement).colSpan = endCol - startCol
    trEl.appendChild(seg.el)

    if (endCol < colCnt) {
      trEl.appendChild(createElement('td', { colSpan: colCnt - endCol }))
    }

    let introHtml = dayGrid.renderProps.renderIntroHtml()
    if (introHtml) {
      if (dayGrid.isRtl) {
        appendToElement(trEl, introHtml)
      } else {
        prependToElement(trEl, introHtml)
      }
    }

    return skeletonEl
  }

}
