import { FillRenderer, subrenderer, BaseFillRendererProps, isArraysEqual } from '@fullcalendar/core'
import { DayBgCellModel } from '@fullcalendar/daygrid'
import { attachSegs, detachSegs } from './TimeCols'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'


export interface TimeColsFillsProps extends BaseFillRendererProps {
  containerEls: HTMLElement[]
  coords: TimeColsSlatsCoords
  cells: DayBgCellModel[]
}


export default class TimeColsFills extends FillRenderer<TimeColsFillsProps> {

  private attachSegs = subrenderer(attachSegs, detachSegs)


  render(props: TimeColsFillsProps) {
    let { coords } = props

    let segs = this.renderSegs({
      type: props.type,
      segs: props.segs
    })

    this.attachSegs({
      segs,
      containerEls: props.containerEls
    })

    if (coords) {
      coords.computeSegVerticals(segs, props.cells, 0)
      coords.assignSegVerticals(segs)
    }
  }

}

TimeColsFills.addPropsEquality({
  containerEls: isArraysEqual
})
