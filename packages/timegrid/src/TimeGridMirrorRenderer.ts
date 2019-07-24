import { Seg } from '@fullcalendar/core'
import TimeGridEventRenderer from './TimeGridEventRenderer'


export default class TimeGridMirrorRenderer extends TimeGridEventRenderer {

  sourceSeg: Seg

  attachSegs(segs: Seg[], mirrorInfo) {
    this.segsByCol = this.timeGrid.groupSegsByCol(segs)
    this.timeGrid.attachSegsByCol(this.segsByCol, this.timeGrid.mirrorContainerEls)

    this.sourceSeg = mirrorInfo.sourceSeg
  }

  generateSegCss(seg: Seg) {
    let props = super.generateSegCss(seg)
    let { sourceSeg } = this

    if (sourceSeg && sourceSeg.col === seg.col) {
      let sourceSegProps = super.generateSegCss(sourceSeg)

      props.left = sourceSegProps.left
      props.right = sourceSegProps.right
      props.marginLeft = sourceSegProps.marginLeft
      props.marginRight = sourceSegProps.marginRight
    }

    return props
  }

}
