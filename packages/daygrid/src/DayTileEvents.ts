import {
  Seg,
  ComponentContext,
  BaseFgEventRendererProps,
  subrenderer,
  removeElement
} from '@fullcalendar/core'
import CellEvents from './CellEvents'


export interface DayTileEventsProps extends BaseFgEventRendererProps {
  segContainerEl: HTMLElement
}

export default class DayTileEvents extends CellEvents<DayTileEventsProps> {

  attachSegs = subrenderer(attachSegs, detachSegs)


  render(props: DayTileEventsProps, context: ComponentContext) {
    let segs = this.renderSegs({
      segs: props.segs,
      selectedInstanceId: props.selectedInstanceId,
      hiddenInstances: props.hiddenInstances,
      isDragging: props.isDragging,
      isResizing: props.isResizing,
      isSelecting: props.isSelecting,
      interactingSeg: props.interactingSeg
    })

    this.attachSegs({
      parentEl: props.segContainerEl,
      segs
    })
  }

}


function attachSegs({ segs, parentEl }: { segs: Seg[], parentEl: HTMLElement }) {
  for (let seg of segs) {
    parentEl.appendChild(seg.el)
  }

  return segs
}


function detachSegs(segs: Seg[]) {
  segs.forEach((seg) => removeElement(seg.el))
}
