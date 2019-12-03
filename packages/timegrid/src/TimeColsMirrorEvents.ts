import { Seg } from '@fullcalendar/core'
import TimeColsEvents from './TimeColsEvents'
import TimeCols from './TimeCols'


export default class TimeColsMirrorEvents extends TimeColsEvents {


  generateSegCss(seg: Seg, timeGrid: TimeCols) {
    let cssProps = super.generateSegCss(seg, timeGrid)
    let { interactingSeg } = this.props

    if (interactingSeg && interactingSeg.col === seg.col) {
      let sourceSegProps = super.generateSegCss(interactingSeg, timeGrid)

      cssProps.left = sourceSegProps.left
      cssProps.right = sourceSegProps.right
      cssProps.marginLeft = sourceSegProps.marginLeft
      cssProps.marginRight = sourceSegProps.marginRight
    }

    return cssProps
  }

}
