import { htmlToElement, createElement } from '../util/dom'
import FillRenderer from '../component/renderers/FillRenderer'
import DayGrid from './DayGrid'


export default class DayGridFillRenderer extends FillRenderer {

  component: DayGrid
  fillSegTag: string = 'td' // override the default tag name


  attachSegEls(type, segs) {
    let els = []
    let i
    let seg
    let skeletonEl: HTMLElement

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      skeletonEl = this.renderFillRow(type, seg)
      this.component.rowEls[seg.row].appendChild(skeletonEl)
      els.push(skeletonEl)
    }

    return els
  }


  // Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
  renderFillRow(type, seg): HTMLElement {
    let colCnt = this.component.colCnt
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

    this.component.bookendCells(trEl)

    return skeletonEl
  }

}
