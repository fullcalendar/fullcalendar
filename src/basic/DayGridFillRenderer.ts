import * as $ from 'jquery'
import FillRenderer from '../component/renderers/FillRenderer'


export default class DayGridFillRenderer extends FillRenderer {

  fillSegTag: string = 'td' // override the default tag name


  attachSegEls(type, segs) {
    let nodes = []
    let i
    let seg
    let skeletonEl

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      skeletonEl = this.renderFillRow(type, seg)
      this.component.rowEls.eq(seg.row).append(skeletonEl)
      nodes.push(skeletonEl[0])
    }

    return nodes
  }


  // Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
  renderFillRow(type, seg) {
    let colCnt = this.component.colCnt
    let startCol = seg.leftCol
    let endCol = seg.rightCol + 1
    let className
    let skeletonEl
    let trEl

    if (type === 'businessHours') {
      className = 'bgevent'
    } else {
      className = type.toLowerCase()
    }

    skeletonEl = $(
      '<div class="fc-' + className + '-skeleton">' +
        '<table><tr/></table>' +
      '</div>'
    )
    trEl = skeletonEl.find('tr')

    if (startCol > 0) {
      trEl.append(
        // will create (startCol + 1) td's
        new Array(startCol + 1).join('<td/>')
      )
    }

    trEl.append(
      seg.el.attr('colspan', endCol - startCol)
    )

    if (endCol < colCnt) {
      trEl.append(
        // will create (colCnt - endCol) td's
        new Array(colCnt - endCol + 1).join('<td/>')
      )
    }

    this.component.bookendCells(trEl)

    return skeletonEl
  }

}
