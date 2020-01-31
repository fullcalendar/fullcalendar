import { Seg } from '@fullcalendar/core'
import TimeColsEvents from './TimeColsEvents'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'


export default class TimeColsMirrorEvents extends TimeColsEvents {


  generateSegCss(seg: Seg, slatCoords: TimeColsSlatsCoords) {
    let cssProps = super.generateSegCss(seg, slatCoords)
    let { interactingSeg } = this.props

    if (interactingSeg && interactingSeg.col === seg.col) {
      let sourceSegProps = super.generateSegCss(interactingSeg, slatCoords)

      cssProps.left = sourceSegProps.left
      cssProps.right = sourceSegProps.right
      cssProps.marginLeft = sourceSegProps.marginLeft
      cssProps.marginRight = sourceSegProps.marginRight
    }

    return cssProps
  }

}
