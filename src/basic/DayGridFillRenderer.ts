import * as $ from 'jquery'
import { htmlToElement, makeElement } from '../util/dom'
import FillRenderer from '../component/renderers/FillRenderer'
import DayGrid from './DayGrid'


export default class DayGridFillRenderer extends FillRenderer {

  component: DayGrid
  fillSegTag: string = 'td' // override the default tag name


  attachSegEls(type, segs) {
    let nodes = []
    let i
    let seg
    let skeletonEl: HTMLElement

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      skeletonEl = this.renderFillRow(type, seg)
      this.component.rowEls[seg.row].appendChild(skeletonEl)
      nodes.push(skeletonEl)
    }

    return nodes
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
        '<table><tr/></table>' +
      '</div>'
    )
    trEl = skeletonEl.getElementsByTagName('tr')[0]

    if (startCol > 0) {
      trEl.appendChild(makeElement('td', { colspan: startCol }))
    }

    seg.el[0].setAttribute('colspan', endCol - startCol)
    trEl.appendChild(seg.el[0])

    if (endCol < colCnt) {
      trEl.appendChild(makeElement('td', { colspan: colCnt - endCol }))
    }

    this.component.bookendCells($(trEl))

    return skeletonEl
  }

}
