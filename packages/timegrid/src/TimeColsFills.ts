import {
  FillRenderer, Seg, renderer, BaseFillRendererProps
} from '@fullcalendar/core'
import TimeCols, { attachSegs, detachSegs } from './TimeCols'

export interface TimeColsFillsProps extends BaseFillRendererProps {
  containerEls: HTMLElement[]
}

export default class TimeColsFills extends FillRenderer<TimeColsFillsProps> {

  private attachSegs = renderer(attachSegs, detachSegs)


  render(props: TimeColsFillsProps) {
    let segs = this.renderSegs(true, {
      type: props.type,
      segs: props.segs
    })

    this.attachSegs(true, {
      segs,
      containerEls: props.containerEls
    })
  }


  computeSegSizes(segs: Seg[], timeGrid: TimeCols) {
    timeGrid.computeSegVerticals(segs)
  }


  assignSegSizes(segs: Seg[], timeGrid: TimeCols) {
    timeGrid.assignSegVerticals(segs)
  }

}
