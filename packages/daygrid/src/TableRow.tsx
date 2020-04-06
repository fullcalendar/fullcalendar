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
  renderFill
} from '@fullcalendar/core'
import TableSeg, { splitSegsByFirstCol } from './TableSeg'
import TableCell, { TableCellModel, MoreLinkArg } from './TableCell'
import TableEvent from './TableEvent'
import { computeFgSegPlacement } from './event-placement'


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

  public cellElRefs = new RefMap<HTMLTableCellElement>()
  private cellInnerElRefs = new RefMap<HTMLElement>()
  private cellContentElRefs = new RefMap<HTMLDivElement>()
  private segHarnessRefs = new RefMap<HTMLDivElement>()


  render(props: TableRowProps, state: TableRowState, context: ComponentContext) {
    let colCnt = props.cells.length

    let businessHoursByCol = splitSegsByFirstCol(props.businessHourSegs, colCnt)
    let bgEventSegsByCol = splitSegsByFirstCol(props.bgEventSegs, colCnt)
    let highlightSegsByCol = splitSegsByFirstCol(this.getHighlightSegs(), colCnt)
    let mirrorSegsByCol = splitSegsByFirstCol(this.getMirrorSegs(), colCnt)

    let { paddingBottoms, finalSegsByCol, segsByFirstCol, segIsNoDisplay, segTops, segMarginTops, moreCnts, moreTops } = computeFgSegPlacement(
      props.fgEventSegs,
      props.dayMaxEvents,
      props.dayMaxEventRows,
      state.segHeights,
      state.maxContentHeight,
      colCnt,
      context.eventOrderSpecs
    )

    let interactionAffectedInstances = // TODO: messy way to compute this
      (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
      (props.eventResize ? props.eventResize.affectedInstances : null) ||
      {}

    return (
      <tr>
        {props.renderIntro && props.renderIntro()}
        {props.cells.map((cell, col) => {
          let normalFgNodes = this.renderFgSegs(
            segsByFirstCol[col],
            segIsNoDisplay,
            segTops,
            segMarginTops,
            interactionAffectedInstances,
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
              elRef={this.cellElRefs.createRef(col)}
              innerElRef={this.cellInnerElRefs.createRef(col) /* rename */}
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
              segIsNoDisplay={segIsNoDisplay}
              fgPaddingBottom={paddingBottoms[col]}
              fgContentElRef={this.cellContentElRefs.createRef(col)}
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
    this.updateSizing(true, false)
  }


  componentDidUpdate(prevProps: TableRowProps, prevState: TableRowState) {
    let currentProps = this.props

    this.updateSizing(
      // any props changes that could affect sizing
      // HACKY. fix to prevent moreLink from unmounting during event drag
      prevProps.cells !== currentProps.cells ||
        prevProps.fgEventSegs !== currentProps.fgEventSegs ||
        prevProps.dayMaxEvents !== currentProps.dayMaxEvents ||
        prevProps.dayMaxEventRows !== currentProps.dayMaxEventRows ||
        prevProps.clientWidth !== currentProps.clientWidth ||
        prevProps.showDayNumbers !== currentProps.showDayNumbers ||
        prevProps.showWeekNumbers !== currentProps.showWeekNumbers,
      prevState.cellContentPositions !== this.state.cellContentPositions
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
    segIsNoDisplay: { [instanceId: string]: boolean },
    segTops: { [instanceId: string]: number },
    segMarginTops: { [instanceId: string]: number },
    segIsInvisible: { [instanceId: string]: any },
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
        let isAbsolute = isMirror || seg.firstCol !== seg.lastCol || !seg.isStart || !seg.isEnd // TODO: simpler way? NOT DRY
        let marginTop: CssDimValue
        let top: CssDimValue
        let left: CssDimValue
        let right: CssDimValue

        if (!isAbsolute) {
          marginTop = segMarginTops[instanceId]

        } else {
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
        }

        nodes.push(
          <div
            class={'fc-daygrid-event-harness' + (isAbsolute ? ' fc-daygrid-event-harness-abs' : '')}
            key={instanceId}
            ref={isMirror ? null : this.segHarnessRefs.createRef(instanceId)}
            style={{
              display: segIsNoDisplay[instanceId] ? 'none' : '',
              visibility: segIsInvisible[instanceId] ? 'hidden' : '',
              marginTop: marginTop || '',
              top: top || '',
              left: left || '',
              right: right || ''
            }}
          >
            <TableEvent
              seg={seg}
              isDragging={isDragging}
              isResizing={isResizing}
              isDateSelecting={isDateSelecting}
              isSelected={instanceId === eventSelection}
              defaultDisplayEventEnd={defaultDisplayEventEnd}
              {...getSegMeta(seg, todayRange)}
            />
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


  updateSizing(isExternalSizingChange, isCellPositionsChanged) {
    if (
      isExternalSizingChange &&
      this.props.clientWidth !== null // positioning ready?
    ) {
      let cellInnerEls = this.cellInnerElRefs.collect()
      let cellContentEls = this.cellContentElRefs.collect()

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
          ),
          segHeights: null
        })
      }

    } else if (isCellPositionsChanged) {
      let segHeights = mapHash(this.segHarnessRefs.currentMap, (eventHarnessEl) => (
        eventHarnessEl.getBoundingClientRect().height
      ))

      this.setState({
        maxContentHeight: (this.props.dayMaxEvents === true || this.props.dayMaxEventRows === true) ? this.computeMaxContentHeight() : null,
        segHeights
      })
    }
  }


  computeMaxContentHeight() {
    let contentEl = this.cellContentElRefs.currentMap[0]
    return contentEl.getBoundingClientRect().height
  }

}
