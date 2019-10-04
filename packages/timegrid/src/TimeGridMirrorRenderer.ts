import { Seg } from '@fullcalendar/core'
import TimeGridEventRenderer from './TimeGridEventRenderer'
import TimeGrid from './TimeGrid'


export default class TimeGridMirrorRenderer extends TimeGridEventRenderer {


  generateSegCss(seg: Seg, timeGrid: TimeGrid) {
    let cssProps = super.generateSegCss(seg, timeGrid)
    let { sourceSeg } = this.props.mirrorInfo

    if (sourceSeg && sourceSeg.col === seg.col) {
      let sourceSegProps = super.generateSegCss(sourceSeg, timeGrid)

      cssProps.left = sourceSegProps.left
      cssProps.right = sourceSegProps.right
      cssProps.marginLeft = sourceSegProps.marginLeft
      cssProps.marginRight = sourceSegProps.marginRight
    }

    return cssProps
  }

}
