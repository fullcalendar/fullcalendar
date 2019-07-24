import {
  htmlToElement, Seg
} from '@fullcalendar/core'
import DayGridEventRenderer from './DayGridEventRenderer'


export default class DayGridMirrorRenderer extends DayGridEventRenderer {

  attachSegs(segs: Seg[], mirrorInfo) {
    let { sourceSeg } = mirrorInfo
    let rowStructs = this.rowStructs = this.renderSegRows(segs)

    // inject each new event skeleton into each associated row
    this.dayGrid.rowEls.forEach(function(rowNode, row) {
      let skeletonEl = htmlToElement('<div class="fc-mirror-skeleton"><table></table></div>') // will be absolutely positioned
      let skeletonTopEl: HTMLElement
      let skeletonTop

      // If there is an original segment, match the top position. Otherwise, put it at the row's top level
      if (sourceSeg && sourceSeg.row === row) {
        skeletonTopEl = sourceSeg.el
      } else {
        skeletonTopEl = rowNode.querySelector('.fc-content-skeleton tbody')

        if (!skeletonTopEl) { // when no events
          skeletonTopEl = rowNode.querySelector('.fc-content-skeleton table')
        }
      }

      skeletonTop = skeletonTopEl.getBoundingClientRect().top -
        rowNode.getBoundingClientRect().top // the offsetParent origin

      skeletonEl.style.top = skeletonTop + 'px'
      skeletonEl.querySelector('table').appendChild(rowStructs[row].tbodyEl)

      rowNode.appendChild(skeletonEl)
    })
  }

}
