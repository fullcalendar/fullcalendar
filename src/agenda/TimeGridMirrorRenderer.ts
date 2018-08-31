import { applyStyle } from '../util/dom-manip'
import MirrorRenderer from '../component/renderers/MirrorRenderer'
import { Seg } from '../component/DateComponent'


export default class TimeGridMirrorRenderer extends MirrorRenderer {

  renderSegs(segs: Seg[], sourceSeg) {
    let mirrorNodes = []
    let i
    let seg: Seg
    let sourceEl
    let computedStyle

    // TODO: not good to call eventRenderer this way
    this.eventRenderer.renderFgSegsIntoContainers(
      segs,
      this.component.mirrorContainerEls
    )

    // Try to make the segment that is in the same row as sourceSeg look the same
    for (i = 0; i < segs.length; i++) {
      seg = segs[i]

      if (sourceSeg && sourceSeg.col === seg.col) {
        sourceEl = sourceSeg.el
        computedStyle = window.getComputedStyle(sourceEl)
        applyStyle(seg.el, {
          left: computedStyle.left,
          right: computedStyle.right,
          marginLeft: computedStyle.marginLeft,
          marginRight: computedStyle.marginRight
        })
      } else {
        applyStyle(seg.el, {
          left: 0,
          right: 0
        })
      }

      mirrorNodes.push(seg.el)
    }

    return mirrorNodes // must return the elements rendered
  }

  computeSize() {
    this.component.computeSegVerticals(this.segs || [])
  }

  assignSize() {
    this.component.assignSegVerticals(this.segs || [])
  }

}
