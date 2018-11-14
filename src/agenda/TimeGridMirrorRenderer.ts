import { Seg } from '../component/DateComponent'
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

    if (seg.col === this.sourceSeg.col) {
      let sourceSegProps = super.generateSegCss(this.sourceSeg)

      props.left = sourceSegProps.left
      props.right = sourceSegProps.right
      props.marginLeft = sourceSegProps.marginLeft
      props.marginRight = sourceSegProps.marginRight
    }

    return props
  }

}
