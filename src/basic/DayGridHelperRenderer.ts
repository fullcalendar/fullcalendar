import * as $ from 'jquery'
import HelperRenderer from '../component/renderers/HelperRenderer'


export default class DayGridHelperRenderer extends HelperRenderer {

  // Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
  renderSegs(segs, sourceSeg) {
    let helperNodes = []
    let rowStructs

    // TODO: not good to call eventRenderer this way
    rowStructs = this.eventRenderer.renderSegRows(segs)

    // inject each new event skeleton into each associated row
    this.component.rowEls.each(function(row, rowNode) {
      let rowEl = $(rowNode) // the .fc-row
      let skeletonEl = $('<div class="fc-helper-skeleton"><table/></div>') // will be absolutely positioned
      let skeletonTopEl
      let skeletonTop

      // If there is an original segment, match the top position. Otherwise, put it at the row's top level
      if (sourceSeg && sourceSeg.row === row) {
        skeletonTop = sourceSeg.el.position().top
      } else {
        skeletonTopEl = rowEl.find('.fc-content-skeleton tbody')
        if (!skeletonTopEl.length) { // when no events
          skeletonTopEl = rowEl.find('.fc-content-skeleton table')
        }

        skeletonTop = skeletonTopEl.position().top
      }

      skeletonEl.css('top', skeletonTop)
        .find('table')
          .append(rowStructs[row].tbodyEl)

      rowEl.append(skeletonEl)
      helperNodes.push(skeletonEl[0])
    })

    return $(helperNodes) // must return the elements rendered
  }

}
