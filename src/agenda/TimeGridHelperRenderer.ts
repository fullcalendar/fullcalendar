import * as $ from 'jquery'
import HelperRenderer from '../component/renderers/HelperRenderer'


export default class TimeGridHelperRenderer extends HelperRenderer {

  renderSegs(segs, sourceSeg) {
    let helperNodes = []
    let i
    let seg
    let sourceEl

    // TODO: not good to call eventRenderer this way
    this.eventRenderer.renderFgSegsIntoContainers(
      segs,
      this.component.helperContainerEls
    )

    // Try to make the segment that is in the same row as sourceSeg look the same
    for (i = 0; i < segs.length; i++) {
      seg = segs[i]

      if (sourceSeg && sourceSeg.col === seg.col) {
        sourceEl = sourceSeg.el
        seg.el.css({
          left: sourceEl.css('left'),
          right: sourceEl.css('right'),
          'margin-left': sourceEl.css('margin-left'),
          'margin-right': sourceEl.css('margin-right')
        })
      }

      helperNodes.push(seg.el[0])
    }

    return $(helperNodes) // must return the elements rendered
  }

}
