import {
  FillRenderer, Seg
} from '@fullcalendar/core'
import TimeGrid from './TimeGrid'


export default class TimeGridFillRenderer extends FillRenderer {

  timeGrid: TimeGrid

  constructor(timeGrid: TimeGrid) {
    super()

    this.timeGrid = timeGrid
  }

  attachSegs(type, segs: Seg[]) {
    let { timeGrid } = this
    let containerEls

    // TODO: more efficient lookup
    if (type === 'bgEvent') {
      containerEls = timeGrid.bgContainerEls
    } else if (type === 'businessHours') {
      containerEls = timeGrid.businessContainerEls
    } else if (type === 'highlight') {
      containerEls = timeGrid.highlightContainerEls
    }

    timeGrid.attachSegsByCol(timeGrid.groupSegsByCol(segs), containerEls)

    return segs.map(function(seg) {
      return seg.el
    })
  }

  computeSegSizes(segs: Seg[]) {
    this.timeGrid.computeSegVerticals(segs)
  }

  assignSegSizes(segs: Seg[]) {
    this.timeGrid.assignSegVerticals(segs)
  }

}
