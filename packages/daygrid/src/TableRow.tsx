import {
  EventSegUiInteractionState,
  VNode,
  DateComponent,
  h,
  PositionCache,
  RefMap,
  mapHash,
  CssDimValue,
  DateRange,
  ComponentContext,
  getSegMeta,
  DateProfile,
  Fragment,
  BgEvent,
  renderFill,
  isPropsEqual
} from '@fullcalendar/core'
import TableSeg, { splitSegsByFirstCol } from './TableSeg'
import TableCell, { TableCellModel, MoreLinkArg } from './TableCell'
import TableDotEvent from './TableDotEvent'
import TableEvent from './TableEvent'
import { computeFgSegPlacement } from './event-placement'
import { isDotRendering } from './event-rendering'


// TODO: attach to window resize?


export interface TableRowProps {
  cells: TableCellModel[]
  renderIntro?: () => VNode
  businessHourSegs: TableSeg[]
  bgEventSegs: TableSeg[]
  fgEventSegs: TableSeg[]
  dateSelectionSegs: TableSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  dayMaxEvents: boolean | number
  dayMaxEventRows: boolean | number
  clientWidth: number | null
  onMoreClick?: (arg: MoreLinkArg) => void
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumbers: boolean
  showWeekNumbers: boolean
  buildMoreLinkText: (num: number) => string
}

interface TableRowState {
  cellInnerPositions: PositionCache
  cellContentPositions: PositionCache
  maxContentHeight: number | null
  segHeights: { [instanceId: string]: number } | null
}


export default class TableRow extends DateComponent<TableRowProps, TableRowState> {

  private cellElRefs = new RefMap<HTMLTableCellElement>() // the <td>
  private cellInnerElRefs = new RefMap<HTMLElement>() // the fc-daygrid-day-frame
  private cellContentElRefs = new RefMap<HTMLDivElement>() // the fc-daygrid-day-events
  private segHarnessRefs = new RefMap<HTMLDivElement>()

  state: TableRowState = {
    cellInnerPositions: null,
    cellContentPositions: null,
    maxContentHeight: null,
    segHeights: {}
  }


  render(props: TableRowProps, state: TableRowState, context: ComponentContext) {
    let colCnt = props.cells.length

    let businessHoursByCol = splitSegsByFirstCol(props.businessHourSegs, colCnt)
    let bgEventSegsByCol = splitSegsByFirstCol(props.bgEventSegs, colCnt)
    let highlightSegsByCol = splitSegsByFirstCol(this.getHighlightSegs(), colCnt)
    let mirrorSegsByCol = splitSegsByFirstCol(this.getMirrorSegs(), colCnt)

    let { paddingBottoms, finalSegsByCol, segsByFirstCol, segIsHidden, segTops, segMarginTops, moreCnts, moreTops } = computeFgSegPlacement(
      props.fgEventSegs,
      props.dayMaxEvents,
      props.dayMaxEventRows,
      state.segHeights,
      state.maxContentHeight,
      colCnt,
      context.eventOrderSpecs
    )

    let selectedInstanceHash = // TODO: messy way to compute this
      (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
      (props.eventResize ? props.eventResize.affectedInstances : null) ||
      {}

    return (
      <tr>
        {props.renderIntro && props.renderIntro()}
        {props.cells.map((cell, col) => {
          let normalFgNodes = this.renderFgSegs(
            segsByFirstCol[col],
            segIsHidden,
            segTops,
            segMarginTops,
            selectedInstanceHash,
            props.todayRange
          )

          let mirrorFgNodes = this.renderFgSegs(
            mirrorSegsByCol[col],
            {},
            segTops, // use same tops as real rendering
            {},
            {},
            props.todayRange,
            Boolean(props.eventDrag && props.eventDrag.segs.length), // messy check
            Boolean(props.eventResize && props.eventResize.segs.length), // messy check
            false // date-selecting (because mirror is never drawn for date selection)
          )

          let showWeekNumber = props.showWeekNumbers && col === 0

          return (
            <TableCell
              key={cell.key}
              elRef={this.cellElRefs.createRef(cell.key)}
              innerElRef={this.cellInnerElRefs.createRef(cell.key) /* FF <td> problem, but okay to use for left/right. TODO: rename prop */}
              date={cell.date}
              showDayNumber={props.showDayNumbers || showWeekNumber /* for spacing, we need to force day-numbers if week numbers */}
              showWeekNumber={showWeekNumber}
              dateProfile={props.dateProfile}
              todayRange={props.todayRange}
              extraHookProps={cell.extraHookProps}
              extraDataAttrs={cell.extraDataAttrs}
              extraClassNames={cell.extraClassNames}
              moreCnt={moreCnts[col]}
              moreMarginTop={moreTops[col] /* rename */}
              buildMoreLinkText={props.buildMoreLinkText}
              onMoreClick={props.onMoreClick}
              hasEvents={Boolean(normalFgNodes.length)}
              allFgSegs={finalSegsByCol[col]}
              segIsHidden={segIsHidden}
              fgPaddingBottom={paddingBottoms[col]}
              fgContentElRef={this.cellContentElRefs.createRef(cell.key)}
              fgContent={[
                <Fragment>{normalFgNodes}</Fragment>, // Fragment scopes the keys
                <Fragment>{mirrorFgNodes}</Fragment>
              ]}
              bgContent={[
                <Fragment>{this.renderFillSegs(highlightSegsByCol[col], 'highlight')}</Fragment>, // Fragment scopes the keys
                <Fragment>{this.renderFillSegs(businessHoursByCol[col], 'non-business')}</Fragment>,
                <Fragment>{this.renderFillSegs(bgEventSegsByCol[col], 'bg-event')}</Fragment>
              ]}
            />
          )
        })}
      </tr>
    )
  }


  componentDidMount() {
    this.updateSizing(true)
  }


  componentDidUpdate(prevProps: TableRowProps, prevState: TableRowState) {
    let currentProps = this.props

    this.updateSizing(
      !isPropsEqual(prevProps, currentProps)
    )
  }


  getHighlightSegs(): TableSeg[] {
    let { props } = this

    if (props.eventDrag && props.eventDrag.segs.length) { // messy check
      return props.eventDrag.segs as TableSeg[]

    } else if (props.eventResize && props.eventResize.segs.length) { // messy check
      return props.eventResize.segs as TableSeg[]

    } else {
      return props.dateSelectionSegs
    }
  }


  getMirrorSegs(): TableSeg[] {
    let { props } = this

    if (props.eventResize && props.eventResize.segs.length) { // messy check
      return props.eventResize.segs as TableSeg[]

    } else {
      return []
    }
  }


  renderFgSegs(
    segs: TableSeg[],
    segIsHidden: { [instanceId: string]: boolean }, // does NOT mean display:hidden
    segTops: { [instanceId: string]: number },
    segMarginTops: { [instanceId: string]: number },
    selectedInstanceHash: { [instanceId: string]: any },
    todayRange: DateRange,
    isDragging?: boolean,
    isResizing?: boolean,
    isDateSelecting?: boolean
  ) {
    let { context } = this
    let { eventSelection } = this.props
    let { cellInnerPositions, cellContentPositions } = this.state
    let defaultDisplayEventEnd = this.props.cells.length === 1 // colCnt === 1
    let nodes: VNode[] = []

    if (cellInnerPositions && cellContentPositions) {
      for (let seg of segs) {
        let { eventRange } = seg
        let instanceId = eventRange.instance.instanceId
        let isMirror = isDragging || isResizing || isDateSelecting
        let isSelected = selectedInstanceHash[instanceId]
        let isInvisible = segIsHidden[instanceId] || isSelected
        let isAbsolute = segIsHidden[instanceId] || isMirror || seg.firstCol !== seg.lastCol || !seg.isStart || !seg.isEnd // TODO: simpler way? NOT DRY
        let marginTop: CssDimValue
        let top: CssDimValue
        let left: CssDimValue
        let right: CssDimValue

        if (isAbsolute) {
          top = segTops[instanceId]

          // TODO: cache these left/rights so that when vertical coords come around, don't need to recompute?
          if (context.isRtl) {
            right = seg.isStart ? 0 : cellContentPositions.rights[seg.firstCol] - cellInnerPositions.rights[seg.firstCol]
            left = (seg.isEnd ? cellContentPositions.lefts[seg.lastCol] : cellInnerPositions.lefts[seg.lastCol])
              - cellContentPositions.lefts[seg.firstCol]
          } else {
            left = seg.isStart ? 0 : cellInnerPositions.lefts[seg.firstCol] - cellContentPositions.lefts[seg.firstCol]
            right = cellContentPositions.rights[seg.firstCol]
              - (seg.isEnd ? cellContentPositions.rights[seg.lastCol] : cellInnerPositions.rights[seg.lastCol])
          }

        } else {
          marginTop = segMarginTops[instanceId]
        }

        nodes.push(
          <div
            class={'fc-daygrid-event-harness' + (isAbsolute ? ' fc-daygrid-event-harness-abs' : '')}
            key={instanceId}
            ref={isMirror ? null : this.segHarnessRefs.createRef(instanceId)}
            style={{
              visibility: isInvisible ? 'hidden' : '',
              marginTop: marginTop || '',
              top: top || '',
              left: left || '',
              right: right || ''
            }}
          >
            {isDotRendering(eventRange) ?
              <TableDotEvent
                seg={seg}
                isDragging={isDragging}
                isSelected={instanceId === eventSelection}
                defaultDisplayEventEnd={defaultDisplayEventEnd}
                {...getSegMeta(seg, todayRange)}
              /> :
              <TableEvent
                seg={seg}
                isDragging={isDragging}
                isResizing={isResizing}
                isDateSelecting={isDateSelecting}
                isSelected={instanceId === eventSelection}
                defaultDisplayEventEnd={defaultDisplayEventEnd}
                {...getSegMeta(seg, todayRange)}
              />
            }
          </div>
        )
      }
    }

    return nodes
  }


  renderFillSegs(segs: TableSeg[], fillType: string) {
    let { isRtl } = this.context
    let { todayRange } = this.props
    let { cellInnerPositions } = this.state
    let nodes: VNode[] = []

    if (cellInnerPositions) {
      for (let seg of segs) {

        let leftRightCss = isRtl ? {
          right: 0,
          left: cellInnerPositions.lefts[seg.lastCol] - cellInnerPositions.lefts[seg.firstCol]
        } : {
          left: 0,
          right: cellInnerPositions.rights[seg.firstCol] - cellInnerPositions.rights[seg.lastCol],
        }

        // inverse-background events don't have specific instances
        // TODO: might be a key collision. better solution
        let { eventRange } = seg
        let key = eventRange.instance ? eventRange.instance.instanceId : eventRange.def.defId

        nodes.push(
          <div class='fc-daygrid-bg-harness' style={leftRightCss}>
            {fillType === 'bg-event' ?
              <BgEvent
                key={key}
                seg={seg}
                {...getSegMeta(seg, todayRange)}
              /> :
              renderFill(fillType)
            }
          </div>
        )
      }
    }

    return nodes
  }


  updateSizing(isExternalSizingChange) {
    let { props, cellInnerElRefs, cellContentElRefs } = this

    if (props.clientWidth !== null) { // positioning ready?

      if (isExternalSizingChange) {
        let cellInnerEls = props.cells.map((cell) => cellInnerElRefs.currentMap[cell.key])
        let cellContentEls = props.cells.map((cell) => cellContentElRefs.currentMap[cell.key])

        if (cellContentEls.length) {
          let originEl = this.base as HTMLElement // BAD

          this.setState({ // will trigger isCellPositionsChanged...
            cellInnerPositions: new PositionCache(
              originEl,
              cellInnerEls,
              true, // isHorizontal
              false
            ),
            cellContentPositions: new PositionCache(
              originEl,
              cellContentEls,
              true, // isHorizontal (for computeFgSegPlacement)
              false
            )
          })
        }
      }

      let limitByContentHeight = props.dayMaxEvents === true || props.dayMaxEventRows === true

      this.setState({
        segHeights: this.computeSegHeights(),
        maxContentHeight: limitByContentHeight ? this.computeMaxContentHeight() : null
      })
    }
  }


  computeSegHeights() { // query
    return mapHash(this.segHarnessRefs.currentMap, (eventHarnessEl, instanceId) => (
      eventHarnessEl.getBoundingClientRect().height
    ))
  }


  computeMaxContentHeight() {
    let firstKey = this.props.cells[0].key
    let cellEl = this.cellElRefs.currentMap[firstKey]
    let eventsEl = this.cellContentElRefs.currentMap[firstKey]

    return cellEl.getBoundingClientRect().bottom - eventsEl.getBoundingClientRect().top
  }


  public getCellEls() {
    let elMap = this.cellElRefs.currentMap

    return this.props.cells.map((cell) => elMap[cell.key])
  }

}

TableRow.addStateEquality({
  segHeights: isPropsEqual
})
