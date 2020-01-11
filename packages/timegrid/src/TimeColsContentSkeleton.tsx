import {
  h, VNode,
  BaseComponent,
  findElements,
  createRef,
} from '@fullcalendar/core'


export interface TimeColsContentSkeletonProps {
  colCnt: number
  renderIntro: () => VNode[]
  onReceiveContainerEls?: (containers: TimeColsContentSkeletonContainers | null, rootEl: HTMLElement | null) => void
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

  rootElRef = createRef<HTMLTableRowElement>()


  render(props: TimeColsContentSkeletonProps) {
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

    return (
      <tr ref={this.rootElRef}>{cellNodes}</tr>
    )
  }


  componentDidMount() {
    this.sendDom()
  }


  componentDidUpdate() {
    this.sendDom()
  }


  componentWillUnmount() {
    let { onReceiveContainerEls } = this.props
    if (onReceiveContainerEls) {
      onReceiveContainerEls(null, null)
    }
  }


  sendDom() {
    let { onReceiveContainerEls } = this.props

    if (onReceiveContainerEls) {
      let rootEl = this.rootElRef.current
      let colContainerEls = findElements(rootEl, '.fc-content-col')
      let mirrorContainerEls = findElements(rootEl, '.fc-mirror-container')
      let fgContainerEls = findElements(rootEl, '.fc-event-container:not(.fc-mirror-container)')
      let bgContainerEls = findElements(rootEl, '.fc-bgevent-container')
      let highlightContainerEls = findElements(rootEl, '.fc-highlight-container')
      let businessContainerEls = findElements(rootEl, '.fc-business-container')

      onReceiveContainerEls({
        colContainerEls,
        mirrorContainerEls,
        fgContainerEls,
        bgContainerEls,
        highlightContainerEls,
        businessContainerEls
      }, rootEl)
    }
  }

}

TimeColsContentSkeleton.addPropsEquality({
  onReceiveContainerEls: true
})
