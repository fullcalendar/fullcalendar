import {
  removeElement,
  SubRenderer,
  isArraysEqual
} from '@fullcalendar/core'
import { TimeColsSeg } from './TimeCols'


export interface TimeColsNowIndicatorProps {
  colContainerEls: HTMLElement
  nowIndicatorTop: number | null
  segs: TimeColsSeg[]
}


export default class TimeColsNowIndicator extends SubRenderer<TimeColsNowIndicatorProps, HTMLElement[]> {


  render({ colContainerEls, nowIndicatorTop, segs }: TimeColsNowIndicatorProps) {

    let nodes: HTMLElement[] = []

    if (nowIndicatorTop != null) {

      // render lines within the columns
      for (let i = 0; i < segs.length; i++) {
        let lineEl = document.createElement('div')
        lineEl.className = 'fc-now-indicator fc-now-indicator-line'
        lineEl.style.top = nowIndicatorTop + 'px'
        colContainerEls[segs[i].col].appendChild(lineEl)
        nodes.push(lineEl)
      }
    }

    return nodes
  }


  unrender(nodes: HTMLElement[]) {
    nodes.forEach(removeElement)
  }

}

TimeColsNowIndicator.addPropsEquality({
  colContainerEls: isArraysEqual
})
