import { applyStyle } from '../util/dom-manip'
import { Seg } from '../component/DateComponent'
import TimeGridEventRenderer from './TimeGridEventRenderer'


export default class TimeGridMirrorRenderer extends TimeGridEventRenderer {

  attachSegs(segs: Seg[], mirrorInfo) {
    let { sourceSeg } = mirrorInfo

    this.segsByCol = this.timeGrid.groupSegsByCol(segs)
    this.timeGrid.attachSegsByCol(this.segsByCol, this.timeGrid.mirrorContainerEls)

    // Try to make the segment that is in the same row as sourceSeg look the same
    for (let seg of segs) {

      if (sourceSeg && sourceSeg.col === seg.col) {
        let sourceEl = sourceSeg.el
        let computedStyle = window.getComputedStyle(sourceEl)

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
    }
  }

}
