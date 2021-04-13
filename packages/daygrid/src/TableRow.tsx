import {
  EventSegUiInteractionState,
  VNode,
  DateComponent,
  createElement,
  PositionCache,
  RefMap,
  CssDimValue,
  DateRange,
  getSegMeta,
  DateProfile,
  Fragment,
  BgEvent,
  renderFill,
  isPropsEqual,
  createRef,
  buildEventRangeKey,
  sortEventSegs
} from '@fullcalendar/common'
import { TableSeg, splitSegsByFirstCol } from './TableSeg'
import { TableCell, TableCellModel, MoreLinkArg } from './TableCell'
import { TableListItemEvent } from './TableListItemEvent'
import { TableBlockEvent } from './TableBlockEvent'
import { computeFgSegPlacement, TableSegPlacement } from './event-placement'
import { hasListItemDisplay } from './event-rendering'

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
  clientHeight: number | null // simply for causing an updateSize, for when liquid height
  onMoreClick?: (arg: MoreLinkArg & {fromCol: number}) => void
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumbers: boolean
  showWeekNumbers: boolean
  buildMoreLinkText: (num: number) => string
}

interface TableRowState {
  framePositions: PositionCache
  maxContentHeight: number | null
  eventInstanceHeights: { [instanceId: string]: number }
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
    eventInstanceHeights: {},
  }

  render() {
    let { props, state, context } = this
    let colCnt = props.cells.length

    let businessHoursByCol = splitSegsByFirstCol(props.businessHourSegs, colCnt)
    let bgEventSegsByCol = splitSegsByFirstCol(props.bgEventSegs, colCnt)
    let highlightSegsByCol = splitSegsByFirstCol(this.getHighlightSegs(), colCnt)
    let mirrorSegsByCol = splitSegsByFirstCol(this.getMirrorSegs(), colCnt)

    let { placementsByFirstCol, placementsByEachCol, moreCnts, moreMarginTops, cellPaddingBottoms } = computeFgSegPlacement(
      sortEventSegs(props.fgEventSegs, context.options.eventOrder) as TableSeg[],
      props.dayMaxEvents,
      props.dayMaxEventRows,
      state.eventInstanceHeights,
      state.maxContentHeight,
      colCnt,
    )

    let selectedInstanceHash = // TODO: messy way to compute this
      (props.eventDrag && props.eventDrag.affectedInstances) ||
      (props.eventResize && props.eventResize.affectedInstances) ||
      {}

    return (
      <tr ref={this.rootElRef}>
        {props.renderIntro && props.renderIntro()}
        {props.cells.map((cell, col) => {
          let [normalFgNodes, topsByInstanceId] = this.renderFgSegs(
            placementsByFirstCol[col],
            selectedInstanceHash,
            props.todayRange,
          )

          let [mirrorFgNodes] = this.renderFgSegs(
            buildMirrorPlacements(mirrorSegsByCol[col], topsByInstanceId),
            {},
            props.todayRange,
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
              extraHookProps={cell.extraHookProps}
              extraDataAttrs={cell.extraDataAttrs}
              extraClassNames={cell.extraClassNames}
              moreCnt={moreCnts[col]}
              buildMoreLinkText={props.buildMoreLinkText}
              onMoreClick={(arg) => {
                props.onMoreClick({ ...arg, fromCol: col })
              }}
              moreMarginTop={moreMarginTops[col]}
              segPlacements={placementsByEachCol[col]}
              fgPaddingBottom={cellPaddingBottoms[col]}
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
      !isPropsEqual(prevProps, currentProps),
    )
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
    segPlacements: TableSegPlacement[],
    selectedInstanceHash: { [instanceId: string]: any },
    todayRange: DateRange,
    isDragging?: boolean,
    isResizing?: boolean,
    isDateSelecting?: boolean,
  ): [VNode[], { [instanceId: string]: number }] { // [nodes, topsByInstanceId]
    let { context } = this
    let { eventSelection } = this.props
    let { framePositions } = this.state
    let defaultDisplayEventEnd = this.props.cells.length === 1 // colCnt === 1
    let nodes: VNode[] = []
    let topsByInstanceId: { [instanceId: string]: number } = {}

    if (framePositions) {
      for (let placement of segPlacements) {
        let seg = placement.seg
        let { instanceId } = seg.eventRange.instance
        let key = instanceId + ':' + placement.partIndex
        let isSelected = selectedInstanceHash[instanceId]
        let isMirror = isDragging || isResizing || isDateSelecting
        let isHidden = placement.isHidden || isSelected
        let isAbsolute = placement.isAbsolute || isHidden || isMirror
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
        */
        nodes.push(
          <div
            className={'fc-daygrid-event-harness' + (isAbsolute ? ' fc-daygrid-event-harness-abs' : '')}
            key={key}
            ref={isMirror ? null : this.segHarnessRefs.createRef(key)}
            style={{
              visibility: isHidden ? 'hidden' : ('' as any),
              marginTop: isAbsolute ? '' : placement.marginTop,
              top: isAbsolute ? placement.absoluteTop : '',
              left: left,
              right: right,
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

        topsByInstanceId[instanceId] = placement.absoluteTop
      }
    }

    return [nodes, topsByInstanceId]
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
    let { props, frameElRefs } = this

    if (props.clientWidth !== null) { // positioning ready?
      if (isExternalSizingChange) {
        let frameEls = props.cells.map((cell) => frameElRefs.currentMap[cell.key])

        if (frameEls.length) {
          let originEl = this.rootElRef.current

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

      let limitByContentHeight = props.dayMaxEvents === true || props.dayMaxEventRows === true

      this.setState({
        eventInstanceHeights: this.queryEventInstanceHeights(),
        maxContentHeight: limitByContentHeight ? this.computeMaxContentHeight() : null,
      })
    }
  }

  queryEventInstanceHeights() {
    let segElMap = this.segHarnessRefs.currentMap
    let eventInstanceHeights: { [key: string]: number } = {}

    // get the max height amongst instance segs
    for (let key in segElMap) {
      let height = segElMap[key].getBoundingClientRect().height
      let instanceId = key.split(':')[0] // deconstruct how renderFgSegs makes the key

      eventInstanceHeights[instanceId] = Math.max(eventInstanceHeights[instanceId] || 0, height)
    }

    return eventInstanceHeights
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

TableRow.addPropsEquality({
  onMoreClick: true, // never forces rerender
})

TableRow.addStateEquality({
  eventInstanceHeights: isPropsEqual,
})

function buildMirrorPlacements(mirrorSegs: TableSeg[], topsByInstanceId: { [instanceId: string]: number }): TableSegPlacement[] {
  return mirrorSegs.map((seg: TableSeg) => ({
    seg,
    partIndex: 0,
    isHidden: false,
    isAbsolute: true,
    absoluteTop: topsByInstanceId[seg.eventRange.instance.instanceId],
    marginTop: 0
  }))
}
