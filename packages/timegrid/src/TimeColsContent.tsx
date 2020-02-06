import {
  h, VNode,
  BaseComponent,
  subrenderer,
  EventSegUiInteractionState,
  CssDimValue,
  DateMarker,
  RefMap
} from '@fullcalendar/core'
import TimeColsMirrorEvents from './TimeColsMirrorEvents'
import TimeColsEvents from './TimeColsEvents'
import TimeColsFills from './TimeColsFills'
import { TimeColsSeg } from './TimeCols'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'
import TimeColsNowIndicator from './TimeColsNowIndicator'


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


export interface TimeColsContentBodyProps extends TimeColsContentBaseProps {
  nowIndicatorTop: number
}

export interface TimeColsContentBaseProps {
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


export class TimeColsContentBody extends BaseComponent<TimeColsContentBodyProps> {

  private renderMirrorEvents = subrenderer(TimeColsMirrorEvents)
  private renderFgEvents = subrenderer(TimeColsEvents)
  private renderBgEvents = subrenderer(TimeColsFills)
  private renderBusinessHours = subrenderer(TimeColsFills)
  private renderDateSelection = subrenderer(TimeColsFills)
  private renderNowIndicator = subrenderer(TimeColsNowIndicator)

  private colContainerRefs = new RefMap<HTMLElement>()
  private mirrorContainerRefs = new RefMap<HTMLElement>()
  private fgContainerRefs = new RefMap<HTMLElement>()
  private bgContainerRefs = new RefMap<HTMLElement>()
  private highlightContainerRefs = new RefMap<HTMLElement>()
  private businessContainerRefs = new RefMap<HTMLElement>()


  render(props: TimeColsContentBodyProps) {
    let cellNodes: VNode[] = props.renderIntro()

    for (let i = 0; i < props.colCnt; i++) {
      cellNodes.push(
        <td>
          <div class='fc-content-col' ref={this.colContainerRefs.createRef(i)}>
            <div class='fc-event-container fc-mirror-container' ref={this.mirrorContainerRefs.createRef(i)} />
            <div class='fc-event-container' ref={this.fgContainerRefs.createRef(i)} />
            <div class='fc-highlight-container' ref={this.highlightContainerRefs.createRef(i)} />
            <div class='fc-bgevent-container' ref={this.bgContainerRefs.createRef(i)} />
            <div class='fc-business-container' ref={this.businessContainerRefs.createRef(i)} />
          </div>
        </td>
      )
    }

    return (
      <tbody>
        <tr>{cellNodes}</tr>
      </tbody>
    )
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
      containerEls: this.businessContainerRefs.collect(),
      segs: props.businessHourSegs,
      coords: props.coords
    })

    this.renderDateSelection({
      type: 'highlight',
      containerEls: this.highlightContainerRefs.collect(),
      segs: options.selectMirror ? [] : props.dateSelectionSegs, // do highlight if NO mirror
      coords: props.coords
    })

    this.renderBgEvents({
      type: 'bgEvent',
      containerEls: this.bgContainerRefs.collect(),
      segs: props.bgEventSegs,
      coords: props.coords
    })

    this.renderFgEvents({
      containerEls: this.fgContainerRefs.collect(),
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

    this.subrenderMirror(this.mirrorContainerRefs.collect(), options)

    this.renderNowIndicator({
      colContainerEls: this.colContainerRefs.collect(),
      nowIndicatorTop: props.nowIndicatorTop,
      segs: props.nowIndicatorSegs
    } as any) // WTF
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

}
