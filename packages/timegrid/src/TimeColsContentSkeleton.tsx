import {
  h, VNode,
  BaseComponent,
  ComponentContext,
  findElements,
  guid,
} from '@fullcalendar/core'


export interface TimeColsContentSkeletonProps {
  colCnt: number
  colGroupNode: VNode
  renderIntro: () => VNode[]
  handleDom?: (rootEl: HTMLElement | null, containers: TimeColsContentSkeletonContainers | null) => void
}

export interface TimeColsContentSkeletonContainers {
  colContainerEls: HTMLElement[]
  mirrorContainerEls: HTMLElement[]
  fgContainerEls: HTMLElement[]
  bgContainerEls: HTMLElement[]
  highlightContainerEls: HTMLElement[]
  businessContainerEls: HTMLElement[]
}


export default class TimeColsContentSkeleton extends BaseComponent<TimeColsContentSkeletonProps> {


  render(props: TimeColsContentSkeletonProps, state: {}, context: ComponentContext) {
    let { isRtl } = context
    let cellNodes: VNode[] = props.renderIntro()

    for (let i = 0; i < props.colCnt; i++) {
      cellNodes.push(
        <td>
          <div class='fc-content-col'>
            <div class='fc-event-container fc-mirror-container'></div>
            <div class='fc-event-container'></div>
            <div class='fc-highlight-container'></div>
            <div class='fc-bgevent-container'></div>
            <div class='fc-business-container'></div>
          </div>
        </td>
      )
    }

    if (isRtl) {
      cellNodes.reverse()
    }

    return ( // guid rerenders whole DOM every time
      <div class='fc-content-skeleton' ref={this.handleRootEl} key={guid()}>
        <table>
          {props.colGroupNode}
          <tr>{cellNodes}</tr>
        </table>
      </div>
    )
  }


  handleRootEl = (rootEl: HTMLElement | null) => {
    let { handleDom } = this.props
    let containers: TimeColsContentSkeletonContainers | null = null

    if (rootEl) {
      let colContainerEls = findElements(rootEl, '.fc-content-col')
      let mirrorContainerEls = findElements(rootEl, '.fc-mirror-container')
      let fgContainerEls = findElements(rootEl, '.fc-event-container:not(.fc-mirror-container)')
      let bgContainerEls = findElements(rootEl, '.fc-bgevent-container')
      let highlightContainerEls = findElements(rootEl, '.fc-highlight-container')
      let businessContainerEls = findElements(rootEl, '.fc-business-container')

      if (this.context.isRtl) {
        colContainerEls.reverse()
        mirrorContainerEls.reverse()
        fgContainerEls.reverse()
        bgContainerEls.reverse()
        highlightContainerEls.reverse()
        businessContainerEls.reverse()
      }

      containers = {
        colContainerEls,
        mirrorContainerEls,
        fgContainerEls,
        bgContainerEls,
        highlightContainerEls,
        businessContainerEls
      }
    }

    if (handleDom) {
      handleDom(rootEl, containers)
    }
  }

}
