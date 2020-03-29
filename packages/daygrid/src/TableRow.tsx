import {
  EventSegUiInteractionState,
  VNode,
  DateComponent,
  h,
  PositionCache,
  isPropsEqual,
  RefMap,
  mapHash,
  CssDimValue,
  intersectRanges,
  addDays,
  EventRenderRange,
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
  eventLimit: boolean | number
  clientWidth: CssDimValue
  onMoreClick?: (arg: RowMoreLinkArg) => void
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumbers: boolean
  buildMoreLinkText: (num: number) => string
  innerHeight?: number
}

export interface RowMoreLinkArg extends MoreLinkArg {
  allSegs: TableSeg[]
  hiddenSegs: TableSeg[]
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

    let { paddingBottoms, segsByCol, segIsNoDisplay, segTops, segMarginTops, moreCnts, moreTops } = computeFgSegPlacement(
      props.fgEventSegs,
      props.eventLimit,
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
            segsByCol[col],
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

          let showWeekNumber = context.options.weekNumbers && col === 0

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
              onMoreClick={this.handleMoreClick}
              hasEvents={Boolean(normalFgNodes.length)}
              fgPaddingBottom={paddingBottoms[col]}
              fgContentElRef={this.cellContentElRefs.createRef(col)}
              fgContent={[
                <Fragment>{normalFgNodes}</Fragment>, // Fragment scopes the keys
                <Fragment>{mirrorFgNodes}</Fragment>
              ]}
              bgContent={[
                <Fragment>{this.renderFillSegs(highlightSegsByCol[col], 'highlight')}</Fragment>, // Fragment scopes the keys
                <Fragment>{this.renderFillSegs(businessHoursByCol[col], 'nonbusiness')}</Fragment>,
                <Fragment>{this.renderFillSegs(bgEventSegsByCol[col], 'bgevent')}</Fragment>
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
    this.updateSizing(
      !isPropsEqual(prevProps, this.props),
      prevState.cellContentPositions !== this.state.cellContentPositions
    )
  }


  handleMoreClick = (arg: MoreLinkArg) => {
    if (this.props.onMoreClick) {
      let allSegs = resliceDaySegs(this.props.fgEventSegs, arg.date)
      let hiddenSegs = allSegs.slice(allSegs.length - arg.moreCnt)

      this.props.onMoreClick({
        ...arg,
        allSegs,
        hiddenSegs
      })
    }
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
          right: '',
          left: cellInnerPositions.lefts[seg.lastCol] - cellInnerPositions.lefts[seg.firstCol]
        } : {
          left: '',
          right: cellInnerPositions.rights[seg.firstCol] - cellInnerPositions.rights[seg.lastCol],
        }

        // inverse-background events don't have specific instances
        // TODO: might be a key collision. better solution
        let { eventRange } = seg
        let key = eventRange.instance ? eventRange.instance.instanceId : eventRange.def.defId

        nodes.push(
          <div class='fc-daygrid-bg-harness' style={leftRightCss}>
            {fillType === 'bgevent' ?
              <BgEvent
                key={key}
                seg={seg}
                {...getSegMeta(seg, todayRange)}
              /> :
              renderFill(fillType, [ `fc-daygrid-${fillType}` ])
            }
          </div>
        )
      }
    }

    return nodes
  }


  updateSizing(isExternalChange, isHorizontalChange) {
    if (
      isExternalChange &&
      this.props.clientWidth // positioning ready?
    ) {
      let cellInnerEls = this.cellInnerElRefs.collect()
      let cellContentEls = this.cellContentElRefs.collect()

      if (cellContentEls.length) {
        let offsetParent = cellContentEls[0].offsetParent as HTMLElement

        if (offsetParent) { // preact was unmounting the element, but componentDidUpdate was firing after. guard
          this.setState({
            cellInnerPositions: new PositionCache(
              offsetParent,
              cellInnerEls,
              true, // isHorizontal
              false
            ),
            cellContentPositions: new PositionCache(
              offsetParent,
              cellContentEls,
              true, // isHorizontal (for computeFgSegPlacement)
              true // isVertical (for computeMaxContentHeight)
            )
          })
        }
      }

    } else if (isHorizontalChange) {
      let oldSegHeights = this.state.segHeights
      let newSegHeights = mapHash(this.segHarnessRefs.currentMap, (eventHarnessEl: HTMLElement, instanceId) => (
        eventHarnessEl.getBoundingClientRect().height ||
          oldSegHeights[instanceId] || 0 // if seg is hidden for +more link, use previously queried height
      ))

      this.setState({
        maxContentHeight: this.props.eventLimit === true ? this.computeMaxContentHeight() : null,
        segHeights: newSegHeights
      })
    }
  }


  computeMaxContentHeight() {
    let contentEl = this.cellContentElRefs.currentMap[0]
    let cellEl = this.cellElRefs.currentMap[0]

    // contentEl guaranteed not to have bottom margin
    return cellEl.getBoundingClientRect().bottom - contentEl.getBoundingClientRect().top
  }

}


// Given the events within an array of segment objects, reslice them to be in a single day
function resliceDaySegs(segs, dayDate) {
  let dayStart = dayDate
  let dayEnd = addDays(dayStart, 1)
  let dayRange = { start: dayStart, end: dayEnd }
  let newSegs = []

  for (let seg of segs) {
    let eventRange = seg.eventRange
    let origRange = eventRange.range
    let slicedRange = intersectRanges(origRange, dayRange)

    if (slicedRange) {
      newSegs.push({
        ...seg,
        eventRange: {
          def: eventRange.def,
          ui: { ...eventRange.ui, durationEditable: false }, // hack to disable resizing
          instance: eventRange.instance,
          range: slicedRange
        } as EventRenderRange,
        isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
        isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf()
      })
    }
  }

  return newSegs
}
