import HelperRenderer from '../component/renderers/HelperRenderer'
import DayGrid from './DayGrid'
import { htmlToElement } from '../util/dom-manip'


export default class DayGridHelperRenderer extends HelperRenderer {

  component: DayGrid


  // Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
  renderSegs(segs, sourceSeg) {
    let helperNodes = []
    let rowStructs

    // TODO: not good to call eventRenderer this way
    rowStructs = this.eventRenderer.renderSegRows(segs)

    // inject each new event skeleton into each associated row
    this.component.rowEls.forEach(function(rowNode, row) {
      let skeletonEl = htmlToElement('<div class="fc-helper-skeleton"><table></table></div>') // will be absolutely positioned
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
      helperNodes.push(skeletonEl)
    })

    return helperNodes // must return the elements rendered
  }

}
