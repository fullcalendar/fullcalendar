import { htmlToElement } from '../util/dom-manip'
import MirrorRenderer from '../component/renderers/MirrorRenderer'
import DayGrid from './DayGrid'
import { Seg } from '../component/DateComponent'


export default class DayGridMirrorRenderer extends MirrorRenderer {

  component: DayGrid


  // Renders a mock "mirror" event. `sourceSeg` is the associated internal segment object. It can be null.
  renderSegs(segs: Seg[], sourceSeg) {
    let mirrorNodes = []
    let rowStructs

    // TODO: not good to call eventRenderer this way
    rowStructs = this.eventRenderer.renderSegRows(segs)

    // inject each new event skeleton into each associated row
    this.component.rowEls.forEach(function(rowNode, row) {
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
      mirrorNodes.push(skeletonEl)
    })

    return mirrorNodes // must return the elements rendered
  }

}
