import { InlineWeekNumberInfo } from '../../common/WeekNumberContainer'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { BaseComponent, setRef } from '../../vdom-util'
import { DateRange, DateMarker, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import {
  buildEventRangeKey,
  getEventRangeMeta,
  sortEventSegs,
  EventRangeProps,
} from '../../component-util/event-rendering'
import { SlicedCoordRange } from '../../coord-range'
import { DateProfile } from '../../DateProfileGenerator'
import { BgEvent, renderFill } from '../../common/bg-fill'
import { DayTableCell } from '../DayTableModel'
import { RefMap } from '../../util/RefMap'
import { createFormatter } from '../../datelib/formatting'
import { watchHeight, afterSize } from '../../component-util/resize-observer'
import { buildDateStr, buildNavLinkAttrs } from '../../common/nav-link'
import { joinClassNames } from '../../util/html'
import { renderText, ContentContainer } from '../../content-inject/ContentContainer'
import { StandardEvent } from '../../common/StandardEvent'
import { memoize } from '../../util/memoize'
import { ViewContext } from '../../ViewContext'
import { type ReactElement, type Ref } from 'react'
import { DayRowEventRangePart, getDayGridSegKey } from '../TableSeg'
import { DayGridCell } from './DayGridCell'
import { DEFAULT_TABLE_EVENT_TIME_FORMAT, hasListItemDisplay } from '../event-rendering'
import { COL_BORDER_WIDTH } from '../../util/dimensions'
import { MeasuredHeightHarness } from '../../common/MeasuredHeightHarness'
import {
  type Slice,
  getSliceKey,
} from '../../seg-placement/kernel'
import {
  type DayGridPlacementColumn,
  type DayGridSourceSeg,
  DEFAULT_LEVEL_CAPACITY,
  buildDayGridPopoverSegs,
  buildDayGridLevelPlacements,
  buildDayGridPixelPlacements,
  computeDayGridDomCandidateMaxLevels,
  computeDayGridMoreLinkLevelTax,
  estimateLevelCapacity,
  resolveDayGridPlacementMode,
} from '../seg-placement-adapter'
import {
  type DayGridPrintBandSlot,
  type DayGridPrintPlan,
  buildDayGridPrintColumns,
  buildDayGridPrintPlan,
  getDayGridPrintSliceKey,
} from '../print-adapter'
import classNames from '../../styles.module.css'
import {
  DAY_GRID_BG_EVENT_Z_CLASS,
  DAY_GRID_EVENT_Z_CLASS,
  DAY_GRID_HIGHLIGHT_Z_CLASS,
  DAY_GRID_INTERACTION_Z_CLASS,
  DAY_GRID_NON_BUSINESS_Z_CLASS,
} from './z-index'

export interface DayGridRowProps {
  dateProfile: DateProfile
  todayRange: DateRange
  cells: DayTableCell[]
  cellIsNarrow: boolean
  cellIsMicro: boolean
  showDayNumbers: boolean
  showWeekNumbers?: boolean
  forPrint: boolean
  tableMode?: boolean // real tr/td markup, independent of print placement behavior
  borderBottom?: boolean
  className?: string
  role?: string

  // content
  fgEventSegs: (SlicedCoordRange & EventRangeProps)[]
  bgEventSegs: (SlicedCoordRange & EventRangeProps)[]
  businessHourSegs: (SlicedCoordRange & EventRangeProps)[]
  dateSelectionSegs: (SlicedCoordRange & EventRangeProps)[]
  eventDrag: EventSegUiInteractionState<SlicedCoordRange> | null
  eventResize: EventSegUiInteractionState<SlicedCoordRange> | null
  eventSelection: string
  dayMaxEvents: boolean | number
  dayMaxEventRows: boolean | number

  // dimensions
  colWidth?: number
  basis?: number // height before growing
  moreLinkHeight?: number

  // refs
  rootElRef?: Ref<HTMLElement> // needed by TimeGrid, to attach Hit system
  heightRef?: Ref<number>
}

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })

export class DayGridRow extends BaseComponent<DayGridRowProps> {
  // ref
  private headerHeightRefMap = new RefMap<string, number>(() => {
    afterSize(this.handleSegPositioning)
  })
  private mainHeightRefMap = new RefMap<string, number>(() => {
    // Recorded in every screen mode so a row that becomes liquid already knows its
    // ceiling, but only a liquid row's placement depends on it.
    const fgLiquidHeight = this.props.dayMaxEvents === true || this.props.dayMaxEventRows === true
    if (fgLiquidHeight) {
      afterSize(this.handleSegPositioning)
    }
  })
  // Every screen slice (whole or partial) reports its occupied height here.
  private sliceHeightRefMap = new RefMap<string, number>(() => {
    afterSize(this.handleSegPositioning)
  })

  // print-only (band thickness is row-wide while slots render per-cell, so
  // this state must live here; see also buildPrintPlan, renderPrintBandSlots,
  // handlePrintSegHeights, and the reset in componentDidUpdate)
  private handlePrintSegHeightChange = () => {
    afterSize(this.handlePrintSegHeights)
  }
  private printSegHeightRefMap = new RefMap<string, number>(this.handlePrintSegHeightChange)

  // memo
  private buildWeekNumberRenderProps = memoize(buildWeekNumberRenderProps)
  private buildPrintPlan = memoize(buildDayGridPrintPlan)
  private sortEventSegs = memoize(sortEventSegs)

  // internal
  private _isUnmounting: boolean
  private disconnectHeight?: () => void
  private levelCapacity = DEFAULT_LEVEL_CAPACITY

  render() {
    const { props, context, headerHeightRefMap, mainHeightRefMap } = this
    const { cells, tableMode } = props
    const { options } = context

    const weekDateMarker = props.cells[0].date
    const fgEventSegs = this.sortEventSegs(props.fgEventSegs, options.eventOrder)
    const screenFgLiquidHeight = props.dayMaxEvents === true || props.dayMaxEventRows === true
    let printPlan: DayGridPrintPlan | null = null
    let printColumns: DayGridPrintBandSlot[][] | null = null
    let screenColumns: DayGridPlacementColumn[] | null = null
    let screenSliceCoords: ReadonlyMap<string, number> = new Map()
    let screenMainOffsetsByCol: (number | undefined)[] = []
    let screenHeightsByCol: (number | undefined)[] = []

    if (props.forPrint) {
      printPlan = this.buildPrintPlan(
        fgEventSegs,
        options.eventOrderStrict,
        options.eventSlicing,
        cells.length,
      )
      printColumns = buildDayGridPrintColumns(
        printPlan,
        this.printSegHeightRefMap.current,
      )
    } else {
      const placementMode = resolveDayGridPlacementMode(
        props.dayMaxEvents,
        props.dayMaxEventRows,
      )
      const [maxMainTop, minMainHeight] = this.computeFgDims()
      const screenLayout = placementMode === 'auto'
        ? buildDayGridPixelPlacements(
          fgEventSegs,
          options.eventOrderStrict,
          options.eventSlicing,
          cells.length,
          minMainHeight,
          props.moreLinkHeight,
          this.levelCapacity,
          this.sliceHeightRefMap.current,
        )
        : buildDayGridLevelPlacements(
          fgEventSegs,
          computeDayGridDomCandidateMaxLevels(
            placementMode,
            props.dayMaxEvents,
            props.dayMaxEventRows,
            Infinity,
          ),
          computeDayGridMoreLinkLevelTax(placementMode),
          options.eventOrderStrict,
          options.eventSlicing,
          cells.length,
          this.sliceHeightRefMap.current,
        )
      screenColumns = screenLayout.columns
      screenSliceCoords = screenLayout.sliceCoords

      if (maxMainTop != null) {
        for (let col = 0; col < cells.length; col++) {
          const cellHeaderHeight = headerHeightRefMap.current.get(cells[col].key)
          const mainOffset = cellHeaderHeight != null
            ? maxMainTop - cellHeaderHeight
            : undefined

          screenMainOffsetsByCol.push(mainOffset)
          screenHeightsByCol.push(
            mainOffset != null
              ? screenColumns[col].contentHeight + mainOffset
              : undefined,
          )
        }
      }
    }

    const highlightSegs = this.getHighlightSegs()
    const hasNavLink = options.navLinks
    const fullWeekStr = buildDateStr(context, weekDateMarker, 'week')

    const weekNumberRenderProps = this.buildWeekNumberRenderProps(
      weekDateMarker,
      context,
      props.cellIsNarrow,
      hasNavLink,
    )
    const fillsByCol: ReactElement[][] = cells.map(() => [])

    // Table mode gives this theme-positioned node a row-wide canvas hosted by the first cell.
    const weekNumberNode = (props.showWeekNumbers && !props.cellIsMicro) ? (
      <ContentContainer<InlineWeekNumberInfo>
        tag="div"
        attrs={{
          ...(
            hasNavLink
              ? buildNavLinkAttrs(context, weekDateMarker, 'week', fullWeekStr, /* isTabbable = */ false)
              : {}
          ),
          'role': undefined, // HACK: a 'link' role can't be child of a 'row' role
          'aria-hidden': true, // HACK: never part of a11y tree because row already has label and role not allowed
        }}
        className={DAY_GRID_EVENT_Z_CLASS}
        renderProps={weekNumberRenderProps}
        generatorName="inlineWeekNumberContent"
        customGenerator={options.inlineWeekNumberContent}
        defaultGenerator={renderText}
        classNameGenerator={options.inlineWeekNumberClass}
        didMount={options.inlineWeekNumberDidMount}
        willUnmount={options.inlineWeekNumberWillUnmount}
      />
    ) : null

    if (tableMode && weekNumberNode) {
      fillsByCol[0].push(
        <div
          key="week-number"
          className={joinClassNames(
            classNames.fillY,
            classNames.start0,
            classNames.pointerEventsNone,
          )}
          style={{
            width: this.computeSpanWidth(0, cells.length),
          }}
        >
          {weekNumberNode}
        </div>,
      )
    }

    this.appendFillSegs(
      fillsByCol,
      props.businessHourSegs,
      'non-business',
      DAY_GRID_NON_BUSINESS_Z_CLASS,
    )
    this.appendFillSegs(
      fillsByCol,
      props.bgEventSegs,
      'bg-event',
      DAY_GRID_BG_EVENT_Z_CLASS,
    )
    this.appendFillSegs(
      fillsByCol,
      highlightSegs,
      'highlight',
      DAY_GRID_HIGHLIGHT_Z_CLASS,
    )

    const RowTag = tableMode ? 'tr' : 'div'

    return (
      <RowTag
        role={props.role as any /* !!! */}
        aria-label={
          props.role === 'row' // HACK
            ? fullWeekStr
            : undefined // can't have label on non-role div
        }
        className={joinClassNames(
          options.dayRowClass,
          props.className,
          tableMode && classNames.borderless,
          !tableMode && classNames.flexRow,
          !tableMode && classNames.rel, // origin for the inline week number
          !tableMode && classNames.borderlessX,
          !tableMode && classNames.borderlessTop,
          (!tableMode && !props.borderBottom) && classNames.borderlessBottom,
          classNames.isolate,
        )}
        style={{
          flexBasis: tableMode ? undefined : props.basis,
        }}
        ref={this.handleRootEl}
      >
        {!tableMode && weekNumberNode}
        {props.cells.map((cell, col) => {
          const printPopover = printPlan
            ? buildDayGridPopoverSegs(
              printPlan.sourceSegs,
              printPlan.hiddenSlices,
              col,
            )
            : null
          let fg: ReactElement[]

          if (printPlan) {
            fg = this.renderPrintBandSlots(printColumns![col])
          } else {
            fg = [
              ...this.renderLevelFgSegs(
                screenMainOffsetsByCol[col],
                screenColumns![col].renderSlices,
                screenSliceCoords,
              ),
              ...this.renderMirrorFgSegs(
                col,
                screenMainOffsetsByCol[col],
                screenSliceCoords,
              ),
            ]
          }

          return (
            <DayGridCell
              key={cell.key}
              dateProfile={props.dateProfile}
              todayRange={props.todayRange}
              date={cell.date}
              isMajor={cell.isMajor}
              isDisabled={cell.isDisabled}
              showDayNumber={props.showDayNumbers}
              isNarrow={props.cellIsNarrow}
              isMicro={props.cellIsMicro}
              borderStart={Boolean(col)}
              borderBottom={props.borderBottom}
              tableMode={tableMode}

              // content
              fills={fillsByCol[col]}
              segs={printPopover ? printPopover.segs : screenColumns![col].segs}
              hiddenSegs={printPopover ? printPopover.hiddenSegs : screenColumns![col].hiddenSegs}
              fgLiquidHeight={printPlan ? false : screenFgLiquidHeight}
              fg={fg}
              eventDrag={printPlan ? null : props.eventDrag}
              eventResize={printPlan ? null : props.eventResize}
              eventSelection={props.eventSelection}

              // render hooks
              renderProps={cell.renderProps}
              dateSpanProps={cell.dateSpanProps}
              attrs={cell.attrs}
              className={cell.className}

              // dimensions
              fgHeight={printPlan ? undefined : screenHeightsByCol[col]}
              width={props.colWidth}

              // refs
              headerHeightRef={printPlan ? undefined : headerHeightRefMap.createRef(cell.key)}
              mainHeightRef={printPlan ? undefined : mainHeightRefMap.createRef(cell.key)}
            />
          )
        })}
      </RowTag>
    )
  }

  /** Mirrors align with kernel coordinates but bypass admission and measurement. */
  renderMirrorFgSegs(
    col: number,
    mainOffset: number | undefined,
    sliceCoords: ReadonlyMap<string, number>,
  ): ReactElement[] {
    const { props } = this
    const { eventSelection } = props
    const nodes: ReactElement[] = []

    for (const seg of this.getMirrorSegs()) {
      if (seg.start !== col) {
        continue
      }

      const key = getDayGridSegKey(seg)
      const { eventRange } = seg
      const { instanceId } = eventRange.instance
      const top = mainOffset != null
        ? mainOffset + (sliceCoords.get(key) ?? 0)
        : undefined
      const isDragging = Boolean(
        props.eventDrag && props.eventDrag.affectedInstances[instanceId],
      )
      const isResizing = Boolean(
        props.eventResize && props.eventResize.affectedInstances[instanceId],
      )
      const isSelected = instanceId === eventSelection

      nodes.push(
        <MeasuredHeightHarness
          key={`mirror:${key}`}
          className={joinClassNames(
            classNames.abs,
            classNames.start0,
            DAY_GRID_INTERACTION_Z_CLASS,
          )}
          style={{
            top,
            width: this.computeSpanWidth(seg.start, seg.end),
          }}
          heightRef={null}
        >
          {this.renderEventContent(seg, eventRange, {
            isDragging,
            isResizing,
            isMirror: true,
            isSelected,
          })}
        </MeasuredHeightHarness>,
      )
    }

    return nodes
  }

  /** Renders every kernel slice with its own measurement ref. */
  renderLevelFgSegs(
    mainOffset: number | undefined,
    slices: Slice<DayGridSourceSeg>[],
    sliceCoords: ReadonlyMap<string, number>,
  ): ReactElement[] {
    const { props } = this
    const { eventSelection } = props
    const nodes: ReactElement[] = []

    for (const slice of slices) {
      const key = getSliceKey(slice)
      const sliceTop = sliceCoords.get(key)
      const { eventRange } = slice.sourceSeg
      const { instanceId } = eventRange.instance
      const top = mainOffset != null && sliceTop != null
        ? mainOffset + sliceTop
        : undefined
      const isDragging = Boolean(
        props.eventDrag && props.eventDrag.affectedInstances[instanceId],
      )
      const isResizing = Boolean(
        props.eventResize && props.eventResize.affectedInstances[instanceId],
      )
      const isInvisible = isDragging || isResizing || top == null
      const isSelected = instanceId === eventSelection

      nodes.push(
        <MeasuredHeightHarness
          key={key}
          className={joinClassNames(
            classNames.abs,
            classNames.start0,
            isSelected ? DAY_GRID_INTERACTION_Z_CLASS : DAY_GRID_EVENT_Z_CLASS,
          )}
          style={{
            visibility: isInvisible ? 'hidden' : undefined,
            top,
            width: this.computeSpanWidth(slice.start, slice.end),
          }}
          heightRef={this.sliceHeightRefMap.createRef(key)}
        >
          {this.renderEventContent(slice, eventRange, {
            isDragging,
            isResizing,
            isSelected,
          })}
        </MeasuredHeightHarness>,
      )
    }

    return nodes
  }

  /**
   * The inner event, identical on both placement routes. Only the wrapper
   * around it differs: the screen route positions it, print lets it sit at the
   * static top of its band slot.
  */
  private renderEventContent(
    range: SlicedCoordRange,
    eventRange: EventRangeProps['eventRange'],
    interaction: {
      isDragging?: boolean
      isResizing?: boolean
      isMirror?: boolean
      isSelected?: boolean
    },
  ): ReactElement {
    const { props } = this
    const isListItem = hasListItemDisplay(range, eventRange)

    return (
      <StandardEvent
        display={isListItem ? 'list-item' : 'row'}
        eventRange={eventRange}
        isStart={range.isStart}
        isEnd={range.isEnd}
        isDragging={Boolean(interaction.isDragging)}
        isResizing={Boolean(interaction.isResizing)}
        isMirror={Boolean(interaction.isMirror)}
        isSelected={Boolean(interaction.isSelected)}
        isNarrow={props.cellIsNarrow}
        defaultTimeFormat={DEFAULT_TABLE_EVENT_TIME_FORMAT}
        defaultDisplayEventEnd={props.cells.length === 1}
        disableResizing={isListItem}
        forcedTimeText={props.cellIsMicro ? '' : undefined}
        {...getEventRangeMeta(eventRange, props.todayRange)}
      />
    )
  }

  /** Renders aligned print slots with in-flow event wrappers that can paginate with their bands. */
  private renderPrintBandSlots(slots: DayGridPrintBandSlot[]): ReactElement[] {
    const { printSegHeightRefMap } = this

    return slots.map((slot) => {
      const { slice } = slot
      let eventNode: ReactElement | null = null

      if (slice) {
        const sliceKey = getDayGridPrintSliceKey(slice)

        eventNode = (
          <MeasuredHeightHarness
            key={sliceKey}
            className={joinClassNames(
              classNames.rel,
              classNames.flowRoot,
              DAY_GRID_EVENT_Z_CLASS,
            )}
            style={{
              width: this.computeSpanWidth(slice.start, slice.end),
            }}
            heightRef={printSegHeightRefMap.createRef(sliceKey)}
          >
            {/* print has no interaction state at all */}
            {this.renderEventContent(slice, slice.sourceSeg.eventRange, {})}
          </MeasuredHeightHarness>
        )
      }

      return (
        <div
          key={slot.levelIndex}
          className={classNames.breakInsideAvoid}
          style={{ height: slot.thickness }}
        >
          {eventNode}
        </div>
      )
    })
  }

  private computeSpanWidth(start: number, end: number) {
    const span = end - start
    const percentWidth = `${span * 100}%`

    // Flex cells have uniform inner widths, so spans must add crossed borders.
    // Fixed-table cells have uniform outer widths; the borderless first cell's inner
    // width already includes that space, so no border compensation is needed.
    const crossedBorderWidth = this.props.tableMode && start === 0
      ? 0
      : Math.max(0, span - 1) * COL_BORDER_WIDTH

    return crossedBorderWidth
      ? `calc(${percentWidth} + ${crossedBorderWidth}px)`
      : percentWidth
  }

  /** Places each fill in its first cell while allowing its wrapper to span subsequent cells. */
  appendFillSegs(
    fillsByCol: ReactElement[][],
    segs: DayRowEventRangePart[],
    fillType: string,
    zClassName: string,
  ): void {
    const { props, context } = this
    const { todayRange } = props

    for (const seg of segs) {
      fillsByCol[seg.start].push(
        <div
          key={`${fillType}:${buildEventRangeKey(seg.eventRange)}:${seg.start}:${seg.end}`}
          className={joinClassNames(classNames.fillY, classNames.start0, zClassName)}
          style={{
            width: this.computeSpanWidth(seg.start, seg.end),
          }}
        >
          {fillType === 'bg-event' ?
            <BgEvent
              eventRange={seg.eventRange}
              isStart={seg.isStart}
              isEnd={seg.isEnd}
              isNarrow={props.cellIsNarrow}
              isVertical={false}
              {...getEventRangeMeta(seg.eventRange, todayRange)}
            /> : (
              renderFill(fillType, context.options)
            )
          }
        </div>,
      )
    }
  }

  handleRootEl = (rootEl: HTMLElement | null) => {
    this.disconnectHeight?.()
    this.disconnectHeight = undefined
    setRef(this.props.rootElRef, rootEl)

    if (rootEl) {
      this.disconnectHeight = watchHeight(rootEl, (contentHeight) => {
        setRef(this.props.heightRef, contentHeight)
      })
    }
  }

  // Sizing
  // -----------------------------------------------------------------------------------------------

  componentDidMount() {
    this._isUnmounting = false
  }

  componentDidUpdate(prevProps: DayGridRowProps): void {
    if (prevProps.forPrint && !this.props.forPrint) {
      this.printSegHeightRefMap = new RefMap<string, number>(this.handlePrintSegHeightChange)
    }
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.disconnectHeight?.()
    setRef(this.props.heightRef, null)
  }

  computeFgDims(): [maxMainTop: number | undefined, minMainHeight: number | undefined] {
    const { cells } = this.props
    const headerHeightMap = this.headerHeightRefMap.current
    const mainHeightMap = this.mainHeightRefMap.current
    let maxMainTop: number | undefined
    let minMainBottom: number | undefined
    let isComplete = true

    for (const cell of cells) {
      if (cell.isDisabled) {
        continue
      }

      const mainTop = headerHeightMap.get(cell.key)
      const mainHeight = mainHeightMap.get(cell.key)

      if (mainTop == null || mainHeight == null) {
        isComplete = false
      }

      if (mainTop != null) {
        if (maxMainTop === undefined || mainTop > maxMainTop) {
          maxMainTop = mainTop
        }

        if (mainHeight != null) {
          const mainBottom = mainTop + mainHeight

          if (minMainBottom === undefined || mainBottom < minMainBottom) {
            minMainBottom = mainBottom
          }
        }
      }
    }

    return [
      maxMainTop,
      isComplete && minMainBottom != null && maxMainTop != null
        ? minMainBottom - maxMainTop
        : undefined,
    ]
  }

  private handleSegPositioning = () => {
    if (this._isUnmounting || this.props.forPrint) return
    this.updateAutoPlacementRatchets()
    this.forceUpdate()
  }

  /**
   * Grows the row-local DOM candidate frontier from one post-size snapshot.
   * This is the only monotone state auto placement needs: the engine itself
   * consumes exact measurements and never predicts a thickness.
   */
  private updateAutoPlacementRatchets(): void {
    if (resolveDayGridPlacementMode(
      this.props.dayMaxEvents,
      this.props.dayMaxEventRows,
    ) !== 'auto') return

    const [, canvasHeight] = this.computeFgDims()
    if (canvasHeight != null) {
      const smallestSliceHeight = Math.min(...this.sliceHeightRefMap.current.values())
      this.levelCapacity = Math.max(
        this.levelCapacity,
        estimateLevelCapacity(canvasHeight, smallestSliceHeight),
      )
    }
  }

  private handlePrintSegHeights = () => {
    if (this._isUnmounting || !this.props.forPrint) return
    this.forceUpdate()
  }

  // Internal Utils
  // -----------------------------------------------------------------------------------------------

  private getMirrorSegs(): (SlicedCoordRange & EventRangeProps)[] {
    let { props } = this

    if (props.eventResize && props.eventResize.segs.length) { // messy check
      return props.eventResize.segs
    }

    return []
  }

  private getHighlightSegs(): (SlicedCoordRange & EventRangeProps)[] {
    let { props } = this

    if (props.eventDrag && props.eventDrag.segs.length) { // messy check
      return props.eventDrag.segs
    }

    if (props.eventResize && props.eventResize.segs.length) { // messy check
      return props.eventResize.segs
    }

    return props.dateSelectionSegs
  }
}

function buildWeekNumberRenderProps(
  weekDateMarker: DateMarker,
  context: ViewContext,
  isNarrow: boolean,
  hasNavLink: boolean,
): InlineWeekNumberInfo {
  const { dateEnv, options } = context
  const weekNum = dateEnv.computeWeekNumber(weekDateMarker)
  const weekNumTextParts = dateEnv.formatToParts(
    weekDateMarker,
    options.weekNumberFormat || DEFAULT_WEEK_NUM_FORMAT,
  )
  const weekNumText = joinDateTimeFormatParts(weekNumTextParts)
  const weekDateZoned = dateEnv.toDate(weekDateMarker)
  return {
    num: weekNum,
    text: weekNumText,
    textParts: weekNumTextParts,
    date: weekDateZoned,
    isNarrow,
    hasNavLink,
  }
}
