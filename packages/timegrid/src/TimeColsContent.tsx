import {
  h, VNode,
  BaseComponent,
  findElements,
  subrenderer,
  removeElement,
  EventSegUiInteractionState,
  CssDimValue,
  DateMarker,
} from '@fullcalendar/core'
import TimeColsMirrorEvents from './TimeColsMirrorEvents'
import TimeColsEvents from './TimeColsEvents'
import TimeColsFills from './TimeColsFills'
import { TimeColsSeg } from './TimeCols'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'


export interface TimeColsContentProps extends TimeColsContentBaseProps {
  clientWidth: CssDimValue
  tableMinWidth: CssDimValue
  tableColGroupNode: VNode
  nowIndicatorDate: DateMarker | null
  coords: TimeColsSlatsCoords
}


export default class TimeColsContent extends BaseComponent<TimeColsContentProps> {

  render(props: TimeColsContentProps) {
    let nowIndicatorTop = props.coords && props.coords.safeComputeTop(props.nowIndicatorDate)

    return (
      <div class='fc-content-skeleton'>
        <table style={{
          minWidth: props.tableMinWidth,
          width: props.clientWidth
        }}>
          {props.tableColGroupNode}
          <TimeColsContentBody
            colCnt={props.colCnt}
            businessHourSegs={props.businessHourSegs}
            bgEventSegs={props.bgEventSegs}
            fgEventSegs={props.fgEventSegs}
            dateSelectionSegs={props.dateSelectionSegs}
            eventSelection={props.eventSelection}
            eventDrag={props.eventDrag}
            eventResize={props.eventResize}
            nowIndicatorTop={nowIndicatorTop}
            nowIndicatorSegs={props.nowIndicatorSegs}
            coords={props.coords}
            forPrint={props.forPrint}
            renderIntro={props.renderIntro}
          />
        </table>
        {nowIndicatorTop != null &&
          <div
            class='fc-now-indicator fc-now-indicator-arrow'
            style={{ top: nowIndicatorTop }}
          />
        }
      </div>
    )
  }

}


interface TimeColsContentBodyProps extends TimeColsContentBaseProps {
  nowIndicatorTop: number
}

interface TimeColsContentBaseProps {
  colCnt: number
  businessHourSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  fgEventSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  nowIndicatorSegs: TimeColsSeg[]
  coords: TimeColsSlatsCoords
  forPrint: boolean
  renderIntro: () => VNode[]
}


class TimeColsContentBody extends BaseComponent<TimeColsContentBodyProps> {

  private renderMirrorEvents = subrenderer(TimeColsMirrorEvents)
  private renderFgEvents = subrenderer(TimeColsEvents)
  private renderBgEvents = subrenderer(TimeColsFills)
  private renderBusinessHours = subrenderer(TimeColsFills)
  private renderDateSelection = subrenderer(TimeColsFills)
  private renderNowIndicator = subrenderer(this._renderNowIndicator, this._unrenderNowIndicator)

  private colContainerEls: HTMLElement[]
  private mirrorContainerEls: HTMLElement[]
  private fgContainerEls: HTMLElement[]
  private bgContainerEls: HTMLElement[]
  private highlightContainerEls: HTMLElement[]
  private businessContainerEls: HTMLElement[]


  render(props: TimeColsContentBodyProps) {
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
      <tbody ref={this.handleRootEl}>
        <tr>{cellNodes}</tr>
      </tbody>
    )
  }


  handleRootEl = (rootEl: HTMLElement) => {
    if (rootEl) {
      this.colContainerEls = findElements(rootEl, '.fc-content-col')
      this.mirrorContainerEls = findElements(rootEl, '.fc-mirror-container')
      this.fgContainerEls = findElements(rootEl, '.fc-event-container:not(.fc-mirror-container)')
      this.bgContainerEls = findElements(rootEl, '.fc-bgevent-container')
      this.highlightContainerEls = findElements(rootEl, '.fc-highlight-container')
      this.businessContainerEls = findElements(rootEl, '.fc-business-container')
    }
  }


  componentDidMount() {
    this.subrender()
  }


  componentDidUpdate() {
    this.subrender()
  }


  componentWillMount() {
    this.subrenderDestroy()
  }


  subrender() {
    let { props } = this
    let { options } = this.context

    this.renderBusinessHours({
      type: 'businessHours',
      containerEls: this.businessContainerEls,
      segs: props.businessHourSegs,
      coords: props.coords
    })

    this.renderDateSelection({
      type: 'highlight',
      containerEls: this.highlightContainerEls,
      segs: options.selectMirror ? [] : props.dateSelectionSegs, // do highlight if NO mirror
      coords: props.coords
    })

    this.renderBgEvents({
      type: 'bgEvent',
      containerEls: this.bgContainerEls,
      segs: props.bgEventSegs,
      coords: props.coords
    })

    this.renderFgEvents({
      containerEls: this.fgContainerEls,
      segs: props.fgEventSegs,
      selectedInstanceId: props.eventSelection,
      hiddenInstances: // TODO: more convenient
        (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
        (props.eventResize ? props.eventResize.affectedInstances : null),
      isDragging: false,
      isResizing: false,
      isSelecting: false,
      forPrint: props.forPrint,
      coords: props.coords
    })

    this.subrenderMirror(this.mirrorContainerEls, options)

    this.renderNowIndicator({
      nowIndicatorTop: props.nowIndicatorTop,
      segs: props.nowIndicatorSegs
    })
  }


  subrenderMirror(mirrorContainerEls: HTMLElement[], options): TimeColsEvents | null {
    let { props } = this

    if (props.eventDrag && props.eventDrag.segs.length) { // messy check
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.eventDrag.segs,
        isDragging: true,
        isResizing: false,
        isSelecting: false,
        interactingSeg: props.eventDrag.interactingSeg,
        forPrint: props.forPrint,
        coords: props.coords
      })

    } else if (props.eventResize && props.eventResize.segs.length) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.eventResize.segs,
        isDragging: true,
        isResizing: false,
        isSelecting: false,
        interactingSeg: props.eventResize.interactingSeg,
        forPrint: props.forPrint,
        coords: props.coords
      })

    } else if (options.selectMirror) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.dateSelectionSegs,
        isDragging: false,
        isResizing: false,
        isSelecting: true,
        forPrint: props.forPrint,
        coords: props.coords
      })

    } else {
      return this.renderMirrorEvents(false)
    }
  }


  _renderNowIndicator({ nowIndicatorTop, segs }: { nowIndicatorTop: number | null, segs: TimeColsSeg[] }) {

    if (nowIndicatorTop == null) {
      return []
    }

    let nodes: HTMLElement[] = []
    let i

    // render lines within the columns
    for (i = 0; i < segs.length; i++) {
      let lineEl = document.createElement('div')
      lineEl.className = 'fc-now-indicator fc-now-indicator-line'
      lineEl.style.top = nowIndicatorTop + 'px'
      this.colContainerEls[segs[i].col].appendChild(lineEl)
      nodes.push(lineEl)
    }

    return nodes
  }


  _unrenderNowIndicator(nodes: HTMLElement[]) {
    nodes.forEach(removeElement)
  }

}
