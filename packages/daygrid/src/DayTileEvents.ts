import {
  Seg,
  ComponentContext,
  BaseFgEventRendererProps,
  renderer
} from '@fullcalendar/core'
import CellEvents from './CellEvents'


export interface DayTileEventsProps extends BaseFgEventRendererProps {
  segContainerEl: HTMLElement
}

export default class DayTileEvents extends CellEvents<DayTileEventsProps> {

  attachSegs = renderer(attachSegs)


  render(props: DayTileEventsProps, context: ComponentContext) {
    let segs = this.renderSegs({
      segs: props.segs,
      mirrorInfo: props.mirrorInfo,
      selectedInstanceId: props.selectedInstanceId,
      hiddenInstances: props.hiddenInstances
    }, context)

    this.attachSegs(props.segContainerEl, { segs })
  }

}


function attachSegs(props: { segs: Seg[] }) {
  return props.segs.map((seg) => seg.el)
}
