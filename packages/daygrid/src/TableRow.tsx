import { CssDimValue } from '@fullcalendar/core'
import {
  EventSegUiInteractionState,
  DateComponent,
  PositionCache,
  RefMap,
  DateRange,
  getSegMeta,
  DateProfile,
  BgEvent,
  renderFill,
  isPropsEqual,
  buildEventRangeKey,
  sortEventSegs,
  DayTableCell,
} from '@fullcalendar/core/internal'
import {
  VNode,
  createElement,
  Fragment,
  createRef,
} from '@fullcalendar/core/preact'
import { TableSeg, splitSegsByFirstCol } from './TableSeg.js'
import { TableCell } from './TableCell.js'
import { TableListItemEvent } from './TableListItemEvent.js'
import { TableBlockEvent } from './TableBlockEvent.js'
import { computeFgSegPlacement, generateSegKey, generateSegUid, TableSegPlacement } from './event-placement.js'
import { hasListItemDisplay } from './event-rendering.js'

// TODO: attach to window resize?

export interface TableRowProps {
  cells: DayTableCell[]
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
  clientHeight: number | null // simply for causing an updateSize, for when liquid height
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumbers: boolean
  showWeekNumbers: boolean
  forPrint: boolean
  cellMinHeight?: CssDimValue
}

interface TableRowState {
  framePositions: PositionCache
  maxContentHeight: number | null
  segHeights: { [segUid: string]: number } // integers
}

export class TableRow extends DateComponent<TableRowProps, TableRowState> {
  private cellElRefs = new RefMap<HTMLTableCellElement>() // the <td>
  private frameElRefs = new RefMap<HTMLElement>() // the fc-daygrid-day-frame
  private fgElRefs = new RefMap<HTMLDivElement>() // the fc-daygrid-day-events
  private segHarnessRefs = new RefMap<HTMLDivElement>() // indexed by "instanceId:firstCol"
  private rootElRef = createRef<HTMLTableRowElement>()

  state: TableRowState = {
    framePositions: null,
    maxContentHeight: null,
    segHeights: {},
  }

  render() {
    let { props, state, context } = this
    let { options } = context
    let colCnt = props.cells.length

    let businessHoursByCol = splitSegsByFirstCol(props.businessHourSegs, colCnt)
    let bgEventSegsByCol = splitSegsByFirstCol(props.bgEventSegs, colCnt)
    let highlightSegsByCol = splitSegsByFirstCol(this.getHighlightSegs(), colCnt)
    let mirrorSegsByCol = splitSegsByFirstCol(this.getMirrorSegs(), colCnt)

    let { singleColPlacements, multiColPlacements, moreCnts, moreMarginTops } = computeFgSegPlacement(
      sortEventSegs(props.fgEventSegs, options.eventOrder) as TableSeg[],
      props.dayMaxEvents,
      props.dayMaxEventRows,
      options.eventOrderStrict,
      state.segHeights,
      state.maxContentHeight,
      props.cells,
    )

    let isForcedInvisible = // TODO: messy way to compute this
      (props.eventDrag && props.eventDrag.affectedInstances) ||
      (props.eventResize && props.eventResize.affectedInstances) ||
      {}

    return (
      <tr ref={this.rootElRef} role="row">
        {props.renderIntro && props.renderIntro()}
        {props.cells.map((cell, col) => {
          let normalFgNodes = this.renderFgSegs(
            col,
            props.forPrint ? singleColPlacements[col] : multiColPlacements[col],
            props.todayRange,
            isForcedInvisible,
          )

          let mirrorFgNodes = this.renderFgSegs(
            col,
            buildMirrorPlacements(mirrorSegsByCol[col], multiColPlacements),
            props.todayRange,
            {},
            Boolean(props.eventDrag),
            Boolean(props.eventResize),
            false, // date-selecting (because mirror is never drawn for date selection)
          )

          return (
            <TableCell
              key={cell.key}
              elRef={this.cellElRefs.createRef(cell.key)}
              innerElRef={this.frameElRefs.createRef(cell.key) /* FF <td> problem, but okay to use for left/right. TODO: rename prop */}
              dateProfile={props.dateProfile}
              date={cell.date}
              showDayNumber={props.showDayNumbers}
              showWeekNumber={props.showWeekNumbers && col === 0}
              forceDayTop={props.showWeekNumbers /* even displaying weeknum for row, not necessarily day */}
              todayRange={props.todayRange}
              eventSelection={props.eventSelection}
              eventDrag={props.eventDrag}
              eventResize={props.eventResize}
              extraRenderProps={cell.extraRenderProps}
              extraDataAttrs={cell.extraDataAttrs}
              extraClassNames={cell.extraClassNames}
              extraDateSpan={cell.extraDateSpan}
              moreCnt={moreCnts[col]}
              moreMarginTop={moreMarginTops[col]}
              singlePlacements={singleColPlacements[col]}
              fgContentElRef={this.fgElRefs.createRef(cell.key)}
              fgContent={( // Fragment scopes the keys
                <Fragment>
                  <Fragment>{normalFgNodes}</Fragment>
                  <Fragment>{mirrorFgNodes}</Fragment>
                </Fragment>
              )}
              bgContent={( // Fragment scopes the keys
                <Fragment>
                  {this.renderFillSegs(highlightSegsByCol[col], 'highlight')}
                  {this.renderFillSegs(businessHoursByCol[col], 'non-business')}
                  {this.renderFillSegs(bgEventSegsByCol[col], 'bg-event')}
                </Fragment>
              )}
              minHeight={props.cellMinHeight}
            />
          )
        })}
      </tr>
    )
  }

  componentDidMount() {
    this.updateSizing(true)
    this.context.addResizeHandler(this.handleResize)
  }

  componentDidUpdate(prevProps: TableRowProps, prevState: TableRowState) {
    let currentProps = this.props

    this.updateSizing(
      !isPropsEqual(prevProps, currentProps),
    )
  }

  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleResize)
  }

  handleResize = (isForced: boolean) => {
    if (isForced) {
      this.updateSizing(true) // isExternal=true
    }
  }

  getHighlightSegs(): TableSeg[] {
    let { props } = this

    if (props.eventDrag && props.eventDrag.segs.length) { // messy check
      return props.eventDrag.segs as TableSeg[]
    }

    if (props.eventResize && props.eventResize.segs.length) { // messy check
      return props.eventResize.segs as TableSeg[]
    }

    return props.dateSelectionSegs
  }

  getMirrorSegs(): TableSeg[] {
    let { props } = this

    if (props.eventResize && props.eventResize.segs.length) { // messy check
      return props.eventResize.segs as TableSeg[]
    }

    return []
  }

  renderFgSegs(
    col: number,
    segPlacements: TableSegPlacement[],
    todayRange: DateRange,
    isForcedInvisible: { [instanceId: string]: any },
    isDragging?: boolean,
    isResizing?: boolean,
    isDateSelecting?: boolean,
  ): VNode[] {
    let { context } = this
    let { eventSelection } = this.props
    let { framePositions } = this.state
    let defaultDisplayEventEnd = this.props.cells.length === 1 // colCnt === 1
    let isMirror = isDragging || isResizing || isDateSelecting
    let nodes: VNode[] = []

    if (framePositions) {
      for (let placement of segPlacements) {
        let { seg } = placement
        let { instanceId } = seg.eventRange.instance
        let isVisible = placement.isVisible && !isForcedInvisible[instanceId]
        let isAbsolute = placement.isAbsolute
        let left: CssDimValue = ''
        let right: CssDimValue = ''

        if (isAbsolute) {
          if (context.isRtl) {
            right = 0
            left = framePositions.lefts[seg.lastCol] - framePositions.lefts[seg.firstCol]
          } else {
            left = 0
            right = framePositions.rights[seg.firstCol] - framePositions.rights[seg.lastCol]
          }
        }

        /*
        known bug: events that are force to be list-item but span multiple days still take up space in later columns
        todo: in print view, for multi-day events, don't display title within non-start/end segs
        */
        nodes.push(
          <div
            className={'fc-daygrid-event-harness' + (isAbsolute ? ' fc-daygrid-event-harness-abs' : '')}
            key={generateSegKey(seg)}
            ref={isMirror ? null : this.segHarnessRefs.createRef(generateSegUid(seg))}
            style={{
              visibility: isVisible ? ('' as any) : 'hidden',
              marginTop: isAbsolute ? '' : placement.marginTop,
              top: isAbsolute ? placement.absoluteTop : '',
              left,
              right,
            }}
          >
            {hasListItemDisplay(seg) ? (
              <TableListItemEvent
                seg={seg}
                isDragging={isDragging}
                isSelected={instanceId === eventSelection}
                defaultDisplayEventEnd={defaultDisplayEventEnd}
                {...getSegMeta(seg, todayRange)}
              />
            ) : (
              <TableBlockEvent
                seg={seg}
                isDragging={isDragging}
                isResizing={isResizing}
                isDateSelecting={isDateSelecting}
                isSelected={instanceId === eventSelection}
                defaultDisplayEventEnd={defaultDisplayEventEnd}
                {...getSegMeta(seg, todayRange)}
              />
            )}
          </div>,
        )
      }
    }

    return nodes
  }

  renderFillSegs(segs: TableSeg[], fillType: string): VNode {
    let { isRtl } = this.context
    let { todayRange } = this.props
    let { framePositions } = this.state
    let nodes: VNode[] = []

    if (framePositions) {
      for (let seg of segs) {
        let leftRightCss = isRtl ? {
          right: 0,
          left: framePositions.lefts[seg.lastCol] - framePositions.lefts[seg.firstCol],
        } : {
          left: 0,
          right: framePositions.rights[seg.firstCol] - framePositions.rights[seg.lastCol],
        }

        nodes.push(
          <div
            key={buildEventRangeKey(seg.eventRange)}
            className="fc-daygrid-bg-harness"
            style={leftRightCss}
          >
            {fillType === 'bg-event' ?
              <BgEvent seg={seg} {...getSegMeta(seg, todayRange)} /> :
              renderFill(fillType)}
          </div>,
        )
      }
    }

    return createElement(Fragment, {}, ...nodes)
  }

  updateSizing(isExternalSizingChange) {
    let { props, state, frameElRefs } = this

    if (
      !props.forPrint &&
      props.clientWidth !== null // positioning ready?
    ) {
      if (isExternalSizingChange) {
        let frameEls = props.cells.map((cell) => frameElRefs.currentMap[cell.key])

        if (frameEls.length) {
          let originEl = this.rootElRef.current
          let newPositionCache = new PositionCache(
            originEl,
            frameEls,
            true, // isHorizontal
            false,
          )

          if (!state.framePositions || !state.framePositions.similarTo(newPositionCache)) {
            this.setState({ // will trigger isCellPositionsChanged...
              framePositions: new PositionCache(
                originEl,
                frameEls,
                true, // isHorizontal
                false,
              ),
            })
          }
        }
      }

      const oldSegHeights = this.state.segHeights
      const newSegHeights = this.querySegHeights()
      const limitByContentHeight = props.dayMaxEvents === true || props.dayMaxEventRows === true

      this.safeSetState({
        // HACK to prevent oscillations of events being shown/hidden from max-event-rows
        // Essentially, once you compute an element's height, never null-out.
        // TODO: always display all events, as visibility:hidden?
        segHeights: { ...oldSegHeights, ...newSegHeights },

        maxContentHeight: limitByContentHeight ? this.computeMaxContentHeight() : null,
      })
    }
  }

  querySegHeights() {
    let segElMap = this.segHarnessRefs.currentMap
    let segHeights: { [segUid: string]: number } = {}

    // get the max height amongst instance segs
    for (let segUid in segElMap) {
      let height = Math.round(segElMap[segUid].getBoundingClientRect().height)
      segHeights[segUid] = Math.max(segHeights[segUid] || 0, height)
    }

    return segHeights
  }

  computeMaxContentHeight() {
    let firstKey = this.props.cells[0].key
    let cellEl = this.cellElRefs.currentMap[firstKey]
    let fcContainerEl = this.fgElRefs.currentMap[firstKey]

    return cellEl.getBoundingClientRect().bottom - fcContainerEl.getBoundingClientRect().top
  }

  public getCellEls() {
    let elMap = this.cellElRefs.currentMap

    return this.props.cells.map((cell) => elMap[cell.key])
  }
}

TableRow.addStateEquality({
  segHeights: isPropsEqual,
})

function buildMirrorPlacements(mirrorSegs: TableSeg[], colPlacements: TableSegPlacement[][]): TableSegPlacement[] {
  if (!mirrorSegs.length) {
    return []
  }
  let topsByInstanceId = buildAbsoluteTopHash(colPlacements) // TODO: cache this at first render?
  return mirrorSegs.map((seg: TableSeg) => ({
    seg,
    isVisible: true,
    isAbsolute: true,
    absoluteTop: topsByInstanceId[seg.eventRange.instance.instanceId],
    marginTop: 0,
  }))
}

function buildAbsoluteTopHash(colPlacements: TableSegPlacement[][]): { [instanceId: string]: number } {
  let topsByInstanceId: { [instanceId: string]: number } = {}

  for (let placements of colPlacements) {
    for (let placement of placements) {
      topsByInstanceId[placement.seg.eventRange.instance.instanceId] = placement.absoluteTop
    }
  }

  return topsByInstanceId
}
