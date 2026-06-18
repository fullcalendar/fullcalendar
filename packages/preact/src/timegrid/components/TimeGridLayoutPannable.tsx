import { joinClassNames } from '../../util/html'
import { BaseComponent, setRef } from '../../vdom-util'
import { DateMarker, DateRange, rangeContainsMarker, startOfDay } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'
import { DayTableCell } from '../../common/DayTableModel'
import { EventRangeProps } from '../../component-util/event-rendering'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { Hit } from '../../interactions/hit'
import { RefMap } from '../../util/RefMap'
import { Ruler } from '../../scrollgrid/Ruler'
import { Scroller } from '../../scrollgrid/Scroller'
import { ScrollerInterface } from '../../scrollgrid/ScrollerInterface'
import { ScrollerSyncerInterface } from '../../scrollgrid/ScrollerSyncerInterface'
import { SlicedCoordRange } from '../../coord-range'
import { FooterScrollbar } from '../../common/FooterScrollbar'
import { afterSize } from '../../component-util/resize-observer'
import { getIsHeightAuto, getScrollerSyncerClass, getFooterScrollbarSticky, getTableHeaderSticky } from '../../scrollgrid/util'
import { isArraysEqual } from '../../util/array'
import { generateClassName } from '../../content-inject/ContentContainer'
import { type Ref, createRef } from 'react'
import classNames from '../../styles.module.css'
import { DayGridHeaderRow } from '../../daygrid/components/DayGridHeaderRow'
import { RowConfig } from '../../daygrid/header-tier'
import { computeColWidth, dayMicroWidth } from '../../daygrid/components/util'
import { TimeSlatMeta } from "../time-slat-meta"
import { TimeGridRange } from "../TimeColsSeg"
import { TimeGridAllDayHeader } from "./TimeGridAllDayHeader"
import { TimeGridAllDayLane } from "./TimeGridAllDayLane"
import { TimeGridCols } from "./TimeGridCols"
import { TimeGridNowIndicatorArrow } from "./TimeGridNowIndicatorArrow"
import { TimeGridSlatHeader } from "./TimeGridSlatHeader"
import { TimeGridSlatLane } from "./TimeGridSlatLane"
import { computeSlatHeight } from './util'
import { TimeGridWeekNumber } from "./TimeGridWeekNumber"
import { computeViewBorderless } from '../../util/misc'
import { TimeGridAxisEmpty } from "./TimeGridAxisEmpty"
import { isBrowserPrintQuirky } from "./TimeGridCol"

export interface TimeGridLayoutPannableProps {
  dateProfile: DateProfile
  nowDate: DateMarker
  todayRange: DateRange
  cells: DayTableCell[]
  slatMetas: TimeSlatMeta[]
  forPrint: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean

  // header content
  headerTiers: RowConfig<any, { text: string, isDisabled: boolean }>[]

  // all-day content
  fgEventSegs: (SlicedCoordRange & EventRangeProps)[]
  bgEventSegs: (SlicedCoordRange & EventRangeProps)[]
  businessHourSegs: (SlicedCoordRange & EventRangeProps)[]
  dateSelectionSegs: (SlicedCoordRange & EventRangeProps)[]
  eventDrag: EventSegUiInteractionState<SlicedCoordRange> | null
  eventResize: EventSegUiInteractionState<SlicedCoordRange> | null
  dayMaxEvents: boolean | number
  dayMaxEventRows: boolean | number

  // timed content
  fgEventSegsByCol: (TimeGridRange & EventRangeProps)[][]
  bgEventSegsByCol: (TimeGridRange & EventRangeProps)[][]
  businessHourSegsByCol: (TimeGridRange & EventRangeProps)[][]
  nowIndicatorSegsByCol: TimeGridRange[][]
  dateSelectionSegsByCol: (TimeGridRange & EventRangeProps)[][]
  eventDragByCol: EventSegUiInteractionState<TimeGridRange>[]
  eventResizeByCol: EventSegUiInteractionState<TimeGridRange>[]

  // universal content
  eventSelection: string

  // refs
  dayScrollerRef?: Ref<ScrollerInterface>
  timeScrollerRef?: Ref<ScrollerInterface>
  slatHeightRef?: Ref<number>

  // dimensions
  dayMinWidth: number
}

interface TimeGridLayoutPannableState {
  totalWidth?: number
  bodyHeight?: number
  clientWidth?: number
  clientHeight?: number
  sticykBottomScrollbarWidth?: number
  axisWidth?: number
  headerTierHeights: number[]
  slatInnerHeight?: number
}

export class TimeGridLayoutPannable extends BaseComponent<TimeGridLayoutPannableProps, TimeGridLayoutPannableState> {
  state: TimeGridLayoutPannableState = {
    headerTierHeights: [],
  }
  private _isUnmounting: boolean

  // refs
  private headerLabelInnerWidthRefMap = new RefMap<number, number>(() => { // keyed by tierNum
    afterSize(this.handleAxisWidths)
  })
  private headerLabelInnerHeightRefMap = new RefMap<number, number>(() => { // keyed by tierNum
    afterSize(this.handleHeaderHeights)
  })
  private headerMainInnerHeightRefMap = new RefMap<number, number>(() => { // keyed by tierNum
    afterSize(this.handleHeaderHeights)
  })
  private allDayLabelInnerWidth?: number
  private handleAllDayLabelInnerWidth = (width: number) => {
    this.allDayLabelInnerWidth = width
    afterSize(this.handleAxisWidths)
  }
  private slatLabelInnerWidthRefMap = new RefMap<string, number>(() => { // keyed by slatMeta.key
    afterSize(this.handleAxisWidths)
  })
  private slatLabelInnerHeightRefMap = new RefMap<string, number>(() => { // keyed by slatMeta.key
    afterSize(this.handleSlatInnerHeights)
  })
  private slatHeight?: number
  private prevSlatHeight?: number
  private headerScrollerRef = createRef<Scroller>()
  private allDayScrollerRef = createRef<Scroller>()
  private mainScrollerRef = createRef<Scroller>()
  private footScrollerRef = createRef<Scroller>()
  private axisScrollerRef = createRef<Scroller>()

  // internal
  private dayScroller: ScrollerSyncerInterface
  private timeScroller: ScrollerSyncerInterface

  render() {
    const {
      props,
      state,
      context,
      headerLabelInnerWidthRefMap,
      headerLabelInnerHeightRefMap,
      headerMainInnerHeightRefMap,
      slatLabelInnerWidthRefMap,
      slatLabelInnerHeightRefMap,
    } = this
    const { nowDate, headerTiers, forPrint } = props
    const nowTimeMs = nowDate.valueOf() - startOfDay(nowDate).valueOf()
    const { axisWidth, totalWidth, clientWidth, clientHeight, bodyHeight, sticykBottomScrollbarWidth } = state
    const { options } = context
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)

    const endScrollbarWidth = (totalWidth != null && clientWidth != null && axisWidth != null)
      ? totalWidth - clientWidth - (axisWidth + 1) // +1 for hardcoded divider!
      : undefined

    const verticalScrolling = !forPrint && !getIsHeightAuto(options)
    const tableHeaderSticky = !forPrint && getTableHeaderSticky(options)
    const footerScrollbarSticky = !forPrint && getFooterScrollbarSticky(options)

    // TODO: DRY with getIsStack
    const { eventPrintLayout } = options
    const printStackEnabled = (
      eventPrintLayout === 'stack' ||
      (eventPrintLayout !== 'grid' /* aka 'auto' */ && isBrowserPrintQuirky)
    )

    const absPrint = forPrint && !printStackEnabled
    const simplePrint = forPrint && printStackEnabled

    const colCount = props.cells.length
    const [canvasWidth, colWidth] = computeColWidth(colCount, props.dayMinWidth, clientWidth)
    const cellIsMicro = colWidth != null && colWidth <= dayMicroWidth
    const cellIsNarrow = cellIsMicro || (colWidth != null && colWidth <= options.dayNarrowWidth)

    const slatCnt = props.slatMetas.length
    const [slatHeight, slatLiquidHeight] = computeSlatHeight( // TODO: memo?
      verticalScrolling && options.expandRows,
      slatCnt,
      options.slotMinHeight,
      state.slatInnerHeight,
      clientHeight,
    )
    this.slatHeight = slatHeight

    // TODO: have computeSlatHeight return?
    const totalSlatHeight = (slatHeight || 0) * slatCnt

    const forcedBodyHeight = absPrint ? totalSlatHeight : undefined

    const rowsNotExpanding = verticalScrolling && !options.expandRows &&
      clientHeight != null && clientHeight > totalSlatHeight

    const firstBodyRowIndex = options.dayHeaders ? headerTiers.length + 1 : 1

    const bottomScrollbarWidth =
      footerScrollbarSticky
        ? sticykBottomScrollbarWidth
        : (bodyHeight != null && clientHeight != null)
          ? (bodyHeight - clientHeight)
          : undefined

    return (
      <>
        {options.dayHeaders && (
          <div
            className={joinClassNames(
              generateClassName(options.tableHeaderClass, {
                isSticky: tableHeaderSticky,
                borderlessX,
                borderlessTop,
                borderlessBottom,
                multiMonthColumns: 0,
              }),
              // see note in TimeGridLayout about why we don't do classNames.printHeader
              classNames.flexCol,
              tableHeaderSticky && classNames.tableHeaderSticky,
            )}
            style={{
              zIndex: 1,
            }}
          >
            <div className={classNames.flexRow}>
              {/* HEADER / labels
              -------------------------------------------------------------------------------------*/}
              <div
                role='rowgroup'
                className={classNames.contentBox}
                style={{ width: axisWidth }}
              >
                {headerTiers.map((rowConfig, tierNum) => (
                  <div
                    key={tierNum}
                    role='row'
                    aria-rowindex={tierNum + 1}
                    className={joinClassNames(
                      options.dayHeaderRowClass,
                      classNames.flexRow,
                      classNames.contentBox,
                      tierNum < props.headerTiers.length - 1
                        ? classNames.borderOnlyB
                        : classNames.borderNone
                    )}
                    style={{
                      height: state.headerTierHeights[tierNum]
                    }}
                  >
                    {(options.weekNumbers && rowConfig.isDateRow) ? (
                      <TimeGridWeekNumber
                        dateProfile={props.dateProfile}
                        innerWidthRef={headerLabelInnerWidthRefMap.createRef(tierNum)}
                        innerHeightRef={headerLabelInnerHeightRefMap.createRef(tierNum)}
                        width={undefined}
                        isLiquid={true}
                        isNarrow={cellIsNarrow}
                      />
                    ) : (
                      <TimeGridAxisEmpty
                        width={undefined}
                        isLiquid={true}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div
                className={generateClassName(options.slotHeaderDividerClass, {
                  inTableHeader: true,
                  options: { dayMinWidth: options.dayMinWidth },
                })}
              />
              {/* HEADER / main (horizontal scroller)
              -------------------------------------------------------------------------------------*/}
              <Scroller
                horizontal
                hideScrollbars
                className={joinClassNames(classNames.flexRow, classNames.liquid)}
                ref={this.headerScrollerRef}
              >
                {/* TODO: converge with DayGridHeader */}
                <div
                  role='rowgroup'
                  className={canvasWidth == null ? classNames.liquid : ''}
                  style={{ width: canvasWidth }}
                >
                  {props.headerTiers.map((rowConfig, tierNum) => (
                    <DayGridHeaderRow
                      {...rowConfig}
                      key={tierNum}
                      role='row'
                      rowIndex={tierNum}
                      borderBottom={tierNum < props.headerTiers.length - 1}
                      height={state.headerTierHeights[tierNum]}
                      colWidth={colWidth}
                      viewportWidth={clientWidth}
                      innerHeightRef={headerMainInnerHeightRefMap.createRef(tierNum)}
                      cellIsNarrow={cellIsNarrow}
                      cellIsMicro={cellIsMicro}
                      rowLevel={props.headerTiers.length - tierNum - 1}
                    />
                  ))}
                </div>
                {Boolean(endScrollbarWidth) && (
                  <div
                    className={joinClassNames(
                      generateClassName(options.fillerClass, { inTableHeader: true }),
                      classNames.borderOnlyS,
                    )}
                    style={{ minWidth: endScrollbarWidth }}
                  />
                )}
              </Scroller>
            </div>
            <div
              className={generateClassName(options.dayHeaderDividerClass, {
                isSticky: tableHeaderSticky,
                multiMonthColumns: 0,
                options: { allDaySlot: Boolean(options.allDaySlot) },
              })}
            />
          </div>
        )}
        <div // the "body"
          role='rowgroup'
          className={joinClassNames(
            generateClassName(options.tableBodyClass, {
              borderlessX,
              borderlessTop,
              borderlessBottom,
              multiMonthColumns: 0,
            }),
            classNames.flexCol,
            verticalScrolling && classNames.liquid,
            classNames.isolate,
          )}
          style={{
            zIndex: 0,
          }}
        >
          {options.allDaySlot && (
            <>
              <div
                role='row'
                aria-rowindex={firstBodyRowIndex}
                className={classNames.flexRow}
                style={{ zIndex: 1 }}
              >
                {/* ALL-DAY / label
                -----------------------------------------------------------------------------------*/}
                <TimeGridAllDayHeader
                  width={axisWidth}
                  innerWidthRef={this.handleAllDayLabelInnerWidth}
                  isNarrow={cellIsNarrow}
                />
                <div
                  className={generateClassName(options.slotHeaderDividerClass, {
                    inTableHeader: false,
                    options: { dayMinWidth: options.dayMinWidth },
                  })}
                />
                {/* ALL-DAY / main (horizontal scroller)
                -----------------------------------------------------------------------------------*/}
                <Scroller
                  horizontal
                  hideScrollbars
                  // fill remaining width
                  className={joinClassNames(classNames.flexRow, classNames.liquidX)}
                  ref={this.allDayScrollerRef}
                >
                  <div
                    className={classNames.flexRow}
                    style={{ width: canvasWidth }}
                  >
                    <TimeGridAllDayLane
                      dateProfile={props.dateProfile}
                      todayRange={props.todayRange}
                      cells={props.cells}
                      showDayNumbers={false}
                      forPrint={forPrint}
                      isHitComboAllowed={props.isHitComboAllowed}
                      className={joinClassNames(classNames.borderNone, classNames.liquidX)}
                      cellIsNarrow={cellIsNarrow}
                      cellIsMicro={cellIsMicro}

                      // content
                      fgEventSegs={props.fgEventSegs}
                      bgEventSegs={props.bgEventSegs}
                      businessHourSegs={props.businessHourSegs}
                      dateSelectionSegs={props.dateSelectionSegs}
                      eventSelection={props.eventSelection}
                      eventDrag={props.eventDrag}
                      eventResize={props.eventResize}
                      dayMaxEvents={props.dayMaxEvents}
                      dayMaxEventRows={props.dayMaxEventRows}

                      // dimensions
                      colWidth={colWidth}
                    />
                  </div>
                  {Boolean(endScrollbarWidth) && (
                    <div
                      className={joinClassNames(
                        generateClassName(options.fillerClass, { inTableHeader: false }),
                        classNames.borderOnlyS,
                      )}
                      style={{ minWidth: endScrollbarWidth }}
                    />
                  )}
                </Scroller>
              </div>
              {/* TODO: don't show div if no classname */}
              <div
                className={joinClassNames(options.allDayDividerClass)}
                style={{ zIndex: 2 }}
              />
            </>
          )}
          <div
            role='row'
            aria-rowindex={firstBodyRowIndex + (options.allDaySlot ? 1 : 0)}
            className={joinClassNames(
              classNames.flexRow,
              classNames.rel, // for Ruler.fillStart
              verticalScrolling && classNames.liquid,
            )}
            style={{
              zIndex: 0,
            }}
          >
            {/* SLATS / labels (vertical scroller)
            ---------------------------------------------------------------------------------------*/}
            <Scroller
              vertical={verticalScrolling}
              hideScrollbars
              className={joinClassNames(classNames.flexCol, classNames.contentBox)}
              style={{
                width: axisWidth,
              }}
              ref={this.axisScrollerRef}
              clientHeightRef={this.handleBodyHeight}
            >
              {!simplePrint && (
                <>
                  <div // canvas
                    role='rowheader'
                    aria-label={options.timedText}
                    className={joinClassNames(
                      classNames.flexCol,
                      classNames.grow,
                      classNames.rel, // for absPrint and TimeGridNowIndicatorArrow
                    )}
                    style={{
                      height: forcedBodyHeight,
                    }}
                  >
                    <div // label list
                      aria-hidden
                      className={joinClassNames(
                        classNames.flexCol,
                        (verticalScrolling && options.expandRows) && classNames.grow,
                        absPrint && classNames.fillX,
                      )}
                    >
                      {props.slatMetas.map((slatMeta, slatI) => (
                        <TimeGridSlatHeader
                          {...slatMeta /* FYI doesn't need isoTimeStr */}
                          key={slatMeta.key}
                          innerWidthRef={slatLabelInnerWidthRefMap.createRef(slatMeta.key)}
                          innerHeightRef={slatLabelInnerHeightRefMap.createRef(slatMeta.key)}
                          borderTop={Boolean(slatI)}
                          isNarrow={cellIsNarrow}
                          height={slatLiquidHeight ? undefined : slatHeight}
                          liquidHeight={slatLiquidHeight}
                        />
                      ))}
                    </div>
                    {!forPrint && options.nowIndicator && rangeContainsMarker(props.dateProfile.currentRange, nowDate) &&
                      nowTimeMs >= props.dateProfile.slotMinTime.milliseconds &&
                      nowTimeMs < props.dateProfile.slotMaxTime.milliseconds && (
                      <TimeGridNowIndicatorArrow
                        nowDate={nowDate}
                        dateProfile={props.dateProfile}
                        totalHeight={slatHeight != null ? slatHeight * slatCnt : undefined}
                      />
                    )}
                    {Boolean(rowsNotExpanding || bottomScrollbarWidth) && (
                      <div
                        className={joinClassNames(
                          generateClassName(options.fillerClass, { inTableHeader: false }),
                          classNames.borderOnlyT,
                          rowsNotExpanding && classNames.liquid,
                        )}
                        style={{
                          minHeight: bottomScrollbarWidth
                        }}
                      />
                    )}
                  </div>
                </>
              )}
            </Scroller>
            <div
              className={generateClassName(options.slotHeaderDividerClass, {
                inTableHeader: false,
                options: { dayMinWidth: options.dayMinWidth },
              })}
            />
            {/* SLATS / main (scroller)
            ---------------------------------------------------------------------------------------*/}
            <div
              // we need this div because it's bad for Scroller to have left/right borders,
              // AND because we need to containt the FooterScrollbar
              className={joinClassNames(classNames.flexCol, classNames.liquid)}
            >
              <Scroller
                vertical={verticalScrolling}
                horizontal
                hideScrollbars={
                  footerScrollbarSticky || // also means height:auto, so won't need vertical scrollbars anyway
                  forPrint
                }
                className={joinClassNames(
                  classNames.flexCol,
                  classNames.rel, // for Ruler.fillStart
                  verticalScrolling && classNames.liquid,
                )}
                ref={this.mainScrollerRef}
                clientWidthRef={this.handleClientWidth}
                clientHeightRef={this.handleClientHeight}
              >
                <div // canvas (grows b/c of filler at bottom)
                  className={joinClassNames(classNames.flexCol, classNames.grow, classNames.rel)}
                  style={{
                    width: canvasWidth,
                    height: forcedBodyHeight,
                  }}
                >
                  <TimeGridCols
                    dateProfile={props.dateProfile}
                    nowDate={props.nowDate}
                    todayRange={props.todayRange}
                    cells={props.cells}
                    slatCnt={slatCnt}
                    forPrint={forPrint}
                    isHitComboAllowed={props.isHitComboAllowed}
                    className={simplePrint ? '' : classNames.fill}

                    // content
                    fgEventSegsByCol={props.fgEventSegsByCol}
                    bgEventSegsByCol={props.bgEventSegsByCol}
                    businessHourSegsByCol={props.businessHourSegsByCol}
                    nowIndicatorSegsByCol={props.nowIndicatorSegsByCol}
                    dateSelectionSegsByCol={props.dateSelectionSegsByCol}
                    eventDragByCol={props.eventDragByCol}
                    eventResizeByCol={props.eventResizeByCol}
                    eventSelection={props.eventSelection}

                    // dimensions
                    colWidth={colWidth}
                    slatHeight={slatHeight}
                    cellIsNarrow={cellIsNarrow}
                    cellIsMicro={cellIsMicro}
                  />

                  {!simplePrint && (
                    <>
                      <div // slot list
                        aria-hidden
                        className={joinClassNames(
                          classNames.flexCol,
                          (verticalScrolling && options.expandRows) && classNames.grow,
                          absPrint ? classNames.fillX : classNames.rel,
                        )}
                      >
                        {props.slatMetas.map((slatMeta, slatI) => (
                          <div
                            key={slatMeta.key}
                            className={joinClassNames(
                              classNames.flexRow,
                              slatLiquidHeight && classNames.liquid,
                            )}
                            style={{
                              height: slatLiquidHeight ? '' : slatHeight
                            }}
                          >
                            <TimeGridSlatLane
                              {...slatMeta /* FYI doesn't need isoTimeStr */}
                              key={slatMeta.key}
                              borderTop={Boolean(slatI)}
                            />
                          </div>
                        ))}
                      </div>
                      {rowsNotExpanding && (
                        <div
                          className={joinClassNames(
                            generateClassName(options.fillerClass, { inTableHeader: false }),
                            classNames.borderOnlyT,
                            classNames.liquid,
                          )}
                        />
                      )}
                    </>
                  )}
                </div>
              </Scroller>
              {Boolean(footerScrollbarSticky) && (
                <FooterScrollbar
                  isSticky
                  canvasWidth={canvasWidth}
                  scrollerRef={this.footScrollerRef}
                  scrollbarWidthRef={this.handleStickyBottomScrollbarWidth}
                />
              )}
            </div>
          </div>{/* END timed row */}
        </div>{/* END rowgroup */}
        <Ruler widthRef={this.handleTotalWidth} />
      </>
    )
  }

  // Lifecycle
  // -----------------------------------------------------------------------------------------------

  componentDidMount() {
    this._isUnmounting = false
    this.initScrollers()
    this.updateSlatHeight()
  }

  componentDidUpdate() {
    this.updateScrollers()
    this.updateSlatHeight()
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.destroyScrollers()
    this.prevSlatHeight = undefined

    setRef(this.props.slatHeightRef, null)
  }

  updateSlatHeight() {
    if (this.prevSlatHeight !== this.slatHeight) {
      setRef(this.props.slatHeightRef, this.prevSlatHeight = this.slatHeight)
    }
  }

  // Sizing
  // -----------------------------------------------------------------------------------------------

  private handleTotalWidth = (totalWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ totalWidth })
  }

  private handleBodyHeight = (bodyHeight: number) => {
    if (this._isUnmounting) return
    this.setState({ bodyHeight })
  }

  private handleClientWidth = (clientWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ clientWidth })
  }

  private handleClientHeight = (clientHeight: number) => {
    if (this._isUnmounting) return
    this.setState({ clientHeight })
  }

  private handleStickyBottomScrollbarWidth = (sticykBottomScrollbarWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ sticykBottomScrollbarWidth })
  }

  private handleHeaderHeights = () => {
    if (this._isUnmounting) return
    const headerLabelInnerHeightMap = this.headerLabelInnerHeightRefMap.current
    const headerMainInnerHeightMap = this.headerMainInnerHeightRefMap.current
    const heights = []

    // important to loop using 'main' because 'label' might not be tracking height if empty
    for (const [tierNum, mainHeight] of headerMainInnerHeightMap.entries()) {
      heights[tierNum] = Math.max(headerLabelInnerHeightMap.get(tierNum) || 0, mainHeight)
    }

    this.setState({ headerTierHeights: heights })
  }

  private handleSlatInnerHeights = () => {
    if (this._isUnmounting) return
    const slatLabelInnerHeightMap = this.slatLabelInnerHeightRefMap.current
    let max = 0

    for (const slatLabelInnerHeight of slatLabelInnerHeightMap.values()) {
      max = Math.max(max, slatLabelInnerHeight)
    }

    if (this.state.slatInnerHeight !== max) {
      this.setState({ slatInnerHeight: max })
    }
  }

  private handleAxisWidths = () => {
    if (this._isUnmounting) return
    const headerLabelInnerWidthMap = this.headerLabelInnerWidthRefMap.current
    const slatLabelInnerWidthMap = this.slatLabelInnerWidthRefMap.current
    let max = this.allDayLabelInnerWidth || 0 // guard against all-day slot hidden

    for (const headerLabelInnerWidth of headerLabelInnerWidthMap.values()) {
      max = Math.max(max, headerLabelInnerWidth)
    }

    for (const slatLableInnerWidth of slatLabelInnerWidthMap.values()) {
      max = Math.max(max, slatLableInnerWidth)
    }

    if (this.state.axisWidth !== max) {
      this.setState({ axisWidth: max })
    }
  }

  // Scrolling
  // -----------------------------------------------------------------------------------------------

  initScrollers() {
    const ScrollerSyncer = getScrollerSyncerClass(this.context.pluginHooks)

    this.dayScroller = new ScrollerSyncer(true) // horizontal=true
    this.timeScroller = new ScrollerSyncer() // horizontal=false

    setRef(this.props.dayScrollerRef, this.dayScroller)
    setRef(this.props.timeScrollerRef, this.timeScroller)

    this.updateScrollers()
  }

  updateScrollers() {
    this.dayScroller.handleChildren([
      this.headerScrollerRef.current,
      this.allDayScrollerRef.current,
      this.mainScrollerRef.current,
      this.footScrollerRef.current,
    ])

    this.timeScroller.handleChildren([
      this.axisScrollerRef.current,
      this.mainScrollerRef.current,
    ])
  }

  destroyScrollers() {
    setRef(this.props.dayScrollerRef, null)
    setRef(this.props.timeScrollerRef, null)
  }
}

TimeGridLayoutPannable.addPropsEquality({
  headerTierHeights: isArraysEqual,
})
