import {
  htmlToElement, subrenderer, ComponentContext, removeElement
} from '@fullcalendar/core'
import TableEvents, { renderSegRows, TableEventsProps } from './TableEvents'


export default class TableMirrorEvents extends TableEvents {

  protected attachSegs = subrenderer(attachSegs, detachSegs)

}


// Renders the given foreground event segments onto the grid
function attachSegs({ segs, rowEls, colCnt, renderIntro, mirrorInfo }: TableEventsProps, context: ComponentContext) {
  let sourceSeg = mirrorInfo && mirrorInfo.sourceSeg

  let rowStructs = renderSegRows(segs, rowEls.length, colCnt, renderIntro, context)

  // inject each new event skeleton into each associated row
  rowEls.forEach(function(rowNode, row) {
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


  return rowStructs
}


function detachSegs(rowStructs) {
  for (let rowStruct of rowStructs) {
    removeElement(rowStruct.tbodyEl)
  }
}
