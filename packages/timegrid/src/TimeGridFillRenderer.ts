import {
  FillRenderer, Seg, renderer, BaseFillRendererProps
} from '@fullcalendar/core'
import TimeGrid, { attachSegs, detachSegs } from './TimeGrid'

export interface TimeGridFillRendererProps extends BaseFillRendererProps {
  containerEls: HTMLElement[]
}

export default class TimeGridFillRenderer extends FillRenderer<TimeGridFillRendererProps> {

  private attachSegs = renderer(attachSegs, detachSegs)


  render(props: TimeGridFillRendererProps) {
    let segs = this.renderSegs({
      type: props.type,
      segs: props.segs
    })

    this.attachSegs({
      segs,
      containerEls: props.containerEls
    })
  }


  computeSegSizes(segs: Seg[], timeGrid: TimeGrid) {
    timeGrid.computeSegVerticals(segs)
  }


  assignSegSizes(segs: Seg[], timeGrid: TimeGrid) {
    timeGrid.assignSegVerticals(segs)
  }

}
