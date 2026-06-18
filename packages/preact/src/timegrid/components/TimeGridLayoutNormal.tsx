import { joinClassNames } from '../../util/html'
import { afterSize } from '../../component-util/resize-observer'
import { BaseComponent, setRef } from '../../vdom-util'
import { DateMarker, DateRange, rangeContainsMarker, startOfDay } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'
import { DayTableCell } from '../../common/DayTableModel'
import { EventRangeProps } from '../../component-util/event-rendering'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { generateClassName } from '../../content-inject/ContentContainer'
import { getIsHeightAuto, getTableHeaderSticky } from '../../scrollgrid/util'
import { Hit } from '../../interactions/hit'
import { RefMap } from '../../util/RefMap'
import { Ruler } from '../../scrollgrid/Ruler'
import { Scroller } from '../../scrollgrid/Scroller'
import { ScrollerInterface } from '../../scrollgrid/ScrollerInterface'
import { SlicedCoordRange } from '../../coord-range'
import { type Ref } from 'react'
import classNames from '../../styles.module.css'
import { DayGridHeaderRow } from '../../daygrid/components/DayGridHeaderRow'
import { dayMicroWidth } from '../../daygrid/components/util'
import { RowConfig } from '../../daygrid/header-tier'
import { TimeSlatMeta } from "../time-slat-meta"
import { TimeGridRange } from "../TimeColsSeg"
import { TimeGridAllDayHeader } from "./TimeGridAllDayHeader"
import { TimeGridAllDayLane } from "./TimeGridAllDayLane"
import { TimeGridAxisEmpty } from "./TimeGridAxisEmpty"
import { TimeGridCols } from "./TimeGridCols"
import { TimeGridNowIndicatorArrow } from "./TimeGridNowIndicatorArrow"
import { TimeGridSlatHeader } from "./TimeGridSlatHeader"
import { TimeGridSlatLane } from "./TimeGridSlatLane"
import { TimeGridWeekNumber } from "./TimeGridWeekNumber"
import { computeSlatHeight } from './util'
import { isBrowserPrintQuirky } from './TimeGridCol'
import { computeViewBorderless } from '../../util/misc'

export interface TimeGridLayoutNormalProps {
  dateProfile: DateProfile
  nowDate: DateMarker
  todayRange: DateRange
  cells: DayTableCell[]
  slatMetas: TimeSlatMeta[],
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
  timeScrollerRef?: Ref<ScrollerInterface>
  slatHeightRef?: Ref<number>
}

interface TimeGridLayoutState {
  totalWidth?: number
  clientWidth?: number
  clientHeight?: number
  axisWidth?: number
  slatInnerHeight?: number
}

export class TimeGridLayoutNormal extends BaseComponent<TimeGridLayoutNormalProps, TimeGridLayoutState> {
  state = {} as TimeGridLayoutState
  private _isUnmounting: boolean

  // refs
  private headerLabelInnerWidthRefMap = new RefMap<number, number>(() => { // keyed by tierNum
    afterSize(this.handleAxisInnerWidths)
  })
  private allDayLabelInnerWidth?: number
  private handleAllDayLabelInnerWidth = (width: number) => {
    this.allDayLabelInnerWidth = width
    afterSize(this.handleAxisInnerWidths)
  }
  private weekNumberInnerWidth?: number
  private handleWeekNumberInnerWidth = (width: number) => {
    this.weekNumberInnerWidth = width
    afterSize(this.handleAxisInnerWidths)
  }
  private slatLabelInnerWidthRefMap = new RefMap<string, number>(() => { // keyed by slatMeta.key
    afterSize(this.handleAxisInnerWidths)
  })
  private slatLabelInnerHeightRefMap = new RefMap<string, number>(() => { // keyed by slatMeta.key
    afterSize(this.handleSlatInnerHeights)
  })
  private slatHeight?: number
  private prevSlatHeight?: number

  render() {
    const { props, state, context, slatLabelInnerWidthRefMap, slatLabelInnerHeightRefMap, headerLabelInnerWidthRefMap } = this
    const { nowDate, forPrint } = props
    const nowTimeMs = nowDate.valueOf() - startOfDay(nowDate).valueOf()
    const { axisWidth, clientWidth, totalWidth } = state
    const { options } = context
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)

    const endScrollbarWidth = (totalWidth != null && clientWidth != null && !forPrint)
      ? totalWidth - clientWidth
      : undefined

    const verticalScrolling = !forPrint && !getIsHeightAuto(options)
    const tableHeaderSticky = !forPrint && getTableHeaderSticky(options)

    const slatCnt = props.slatMetas.length
    const [slatHeight, slatLiquidHeight] = computeSlatHeight(
      verticalScrolling && options.expandRows,
      slatCnt,
      options.slotMinHeight,
      state.slatInnerHeight,
      state.clientHeight,
    )
    this.slatHeight = slatHeight

    // TODO: have computeSlatHeight return?
    const totalSlatHeight = (slatHeight || 0) * slatCnt

    const rowsNotExpanding = verticalScrolling && !options.expandRows &&
      state.clientHeight != null && state.clientHeight > totalSlatHeight

    // TODO: DRY with getIsStack
    const { eventPrintLayout } = options
    const printStackEnabled = (
      eventPrintLayout === 'stack' ||
      (eventPrintLayout !== 'grid' /* aka 'auto' */ && isBrowserPrintQuirky)
    )

    const absPrint = forPrint && !printStackEnabled
    const simplePrint = forPrint && printStackEnabled

    // for printing
    // in Chrome, slats and columns both need abs positioning within a relative container for them
    // to sync across pages, and the relative container needs an explicit height
    // in Firefox, same applies, but the flex-row for the cells has trouble spanning across page,
    // so we need to set explicit height on flex-row and all parents
    const forcedBodyHeight = absPrint ? totalSlatHeight : undefined

    const colCount = props.cells.length
    const colWidth = clientWidth != null ? clientWidth / colCount : undefined
    const cellIsMicro = colWidth != null && colWidth <= dayMicroWidth
    const cellIsNarrow = cellIsMicro || (colWidth != null && colWidth <= options.dayNarrowWidth)

    return (
      <>
        {/* HEADER
        ---------------------------------------------------------------------------------------*/}
        {options.dayHeaders && (
          <div
            role='rowgroup'
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
            {props.headerTiers.map((rowConfig, tierNum) => (
              <div
                key={tierNum}
                role='row'
                className={classNames.flexRow}
              >
                <div
                  className={joinClassNames(
                    options.dayHeaderRowClass,
                    classNames.flexRow,
                    tierNum < props.headerTiers.length - 1
                      ? classNames.borderOnlyB
                      : classNames.borderNone
                  )}
                >
                  {(options.weekNumbers && rowConfig.isDateRow) ? (
                    <TimeGridWeekNumber
                      dateProfile={props.dateProfile}
                      innerWidthRef={this.handleWeekNumberInnerWidth}
                      innerHeightRef={headerLabelInnerWidthRefMap.createRef(tierNum)}
                      width={axisWidth}
                      isLiquid={false}
                      isNarrow={cellIsNarrow}
                    />
                  ) : (
                    <TimeGridAxisEmpty
                      width={axisWidth}
                      isLiquid={false}
                    />
                  )}
                </div>
                <div
                  className={generateClassName(options.slotHeaderDividerClass, {
                    inTableHeader: true,
                    options: { dayMinWidth: options.dayMinWidth },
                  })}
                />
                <DayGridHeaderRow
                  {...rowConfig}
                  className={classNames.liquid}
                  borderBottom={tierNum < props.headerTiers.length - 1}
                  viewportWidth={clientWidth}
                  cellIsNarrow={cellIsNarrow}
                  cellIsMicro={cellIsMicro}
                  rowLevel={props.headerTiers.length - tierNum - 1}
                />
                {Boolean(endScrollbarWidth) && (
                  <div
                    className={joinClassNames(
                      generateClassName(options.fillerClass, { inTableHeader: true }),
                      classNames.borderOnlyS,
                    )}
                    style={{ minWidth: endScrollbarWidth }}
                  />
                )}
              </div>
            ))}
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
          {/* ALL-DAY
          ---------------------------------------------------------------------------------------*/}
          {options.allDaySlot && (
            <>
              <div
                role='row'
                className={classNames.flexRow}
                style={{ zIndex: 1 }}
              >
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
                <TimeGridAllDayLane
                  dateProfile={props.dateProfile}
                  todayRange={props.todayRange}
                  cells={props.cells}
                  showDayNumbers={false}
                  forPrint={forPrint}
                  isHitComboAllowed={props.isHitComboAllowed}
                  className={joinClassNames(classNames.liquidX, classNames.borderNone)}
                  cellIsNarrow={cellIsNarrow}
                  cellIsMicro={cellIsMicro}
                  // content
                  fgEventSegs={props.fgEventSegs}
                  bgEventSegs={props.bgEventSegs}
                  businessHourSegs={props.businessHourSegs}
                  dateSelectionSegs={props.dateSelectionSegs}
                  eventDrag={props.eventDrag}
                  eventResize={props.eventResize}
                  eventSelection={props.eventSelection}
                  dayMaxEvents={props.dayMaxEvents}
                  dayMaxEventRows={props.dayMaxEventRows}
                />
                {Boolean(endScrollbarWidth) && (
                  <div
                    className={joinClassNames(
                      generateClassName(options.fillerClass, { inTableHeader: false }),
                      classNames.borderOnlyS,
                    )}
                    style={{ minWidth: endScrollbarWidth }}
                  />
                )}
              </div>
              {/* TODO: don't show div if no classname */}
              <div
                className={joinClassNames(options.allDayDividerClass)}
                style={{ zIndex: 2 }}
              />
            </>
          )}
          {/* SLATS
          -----------------------------------------------------------------------------------------*/}
          <Scroller
            vertical={verticalScrolling}
            className={joinClassNames(
              classNames.flexCol,
              classNames.rel, // for Ruler.fillStart
              verticalScrolling && classNames.liquid,
            )}
            style={{
              zIndex: 0,
            }}
            ref={props.timeScrollerRef as any} // HACK
            clientWidthRef={this.handleClientWidth}
            clientHeightRef={this.handleClientHeight}
          >
            <div // canvas (grows b/c of filler at bottom)
              className={joinClassNames(
                classNames.flexCol,
                classNames.grow,
                classNames.rel,
              )}
              style={{
                // in print mode, this div creates the height and everything is absolutely positioned within
                // we need to do this so that slats positioning synces with events's positioning
                // otherwise, get out of sync on second page
                height: forcedBodyHeight,
              }}
            >
              <div
                role='row'
                className={joinClassNames(
                  classNames.flexRow,
                  !simplePrint && classNames.fill,
                )}
              >
                <div
                  role='rowheader'
                  aria-label={options.timedText}
                  className={classNames.contentBox}
                  style={{ width: axisWidth }}
                />
                <div
                  className={generateClassName(options.slotHeaderDividerClass, {
                    inTableHeader: false,
                    options: { dayMinWidth: options.dayMinWidth },
                  })}
                />
                <TimeGridCols
                  dateProfile={props.dateProfile}
                  nowDate={props.nowDate}
                  todayRange={props.todayRange}
                  cells={props.cells}
                  slatCnt={slatCnt}
                  forPrint={forPrint}
                  isHitComboAllowed={props.isHitComboAllowed}
                  className={classNames.liquid}

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
                  slatHeight={slatHeight}
                  cellIsNarrow={cellIsNarrow}
                  cellIsMicro={cellIsMicro}
                />
              </div>

              {!simplePrint && (
                <>
                  <div
                    aria-hidden
                    className={joinClassNames(
                      classNames.flexCol,
                      (verticalScrolling && options.expandRows) && classNames.grow,
                      absPrint
                        ? classNames.fillX // will assume top:0, height will be decided naturally
                        : classNames.rel, // needs abs/rel for zIndex
                    )}
                  >
                    {props.slatMetas.map((slatMeta, slatI) => (
                      <div
                        key={slatMeta.key}
                        className={joinClassNames(
                          slatLiquidHeight && classNames.liquid,
                          classNames.flexRow,
                        )}
                        style={{
                          height: slatLiquidHeight ? undefined : slatHeight
                        }}
                      >
                        <div
                          // the pannable version of TimeGrid has axis labels all consecutive in one column
                          // simulate this for the non-pannable version
                          className={classNames.flexCol}
                          style={{ width: axisWidth }}
                        >
                          <TimeGridSlatHeader
                            {...slatMeta /* FYI doesn't need isoTimeStr */}
                            key={slatMeta.key}
                            innerWidthRef={slatLabelInnerWidthRefMap.createRef(slatMeta.key)}
                            innerHeightRef={slatLabelInnerHeightRefMap.createRef(slatMeta.key)}
                            borderTop={Boolean(slatI)}
                            isNarrow={cellIsNarrow}
                          />
                        </div>
                        <div
                          className={generateClassName(options.slotHeaderDividerClass, {
                            inTableHeader: false,
                            options: { dayMinWidth: options.dayMinWidth },
                          })}
                          style={{ visibility: 'hidden' }}
                          // ^TODO: className?
                          // invisible because dayLanes show the line
                        />
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

                  {!forPrint && options.nowIndicator && rangeContainsMarker(props.dateProfile.currentRange, nowDate) &&
                    nowTimeMs >= props.dateProfile.slotMinTime.milliseconds &&
                    nowTimeMs < props.dateProfile.slotMaxTime.milliseconds && (
                    <TimeGridNowIndicatorArrow
                      nowDate={nowDate}
                      dateProfile={props.dateProfile}
                      totalHeight={slatHeight != null ? slatHeight * slatCnt : undefined}
                    />
                  )}
                </>
              )}
            </div>
          </Scroller>
        </div>
        <Ruler widthRef={this.handleTotalWidth} />
      </>
    )
  }

  // Lifecycle
  // -----------------------------------------------------------------------------------------------

  componentDidMount() {
    this._isUnmounting = false
    this.updateSlatHeight()
  }

  componentDidUpdate() {
    this.updateSlatHeight()
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
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
    // Must delay the rerender because might change the width of the all-day DayGridRow events,
    // which shows a ResizeObserver loop warning
    requestAnimationFrame(() => {
      if (this._isUnmounting) return
      this.setState({ totalWidth })
    })
  }

  private handleClientWidth = (clientWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ clientWidth })
  }

  private handleClientHeight = (clientHeight: number) => {
    if (this._isUnmounting) return
    this.setState({ clientHeight })
  }

  private handleAxisInnerWidths = () => {
    if (this._isUnmounting) return
    const headerLabelInnerWidthMap = this.headerLabelInnerWidthRefMap.current
    const slatLabelInnerWidthMap = this.slatLabelInnerWidthRefMap.current
    let max = Math.max(
      this.weekNumberInnerWidth || 0, // might not exist
      this.allDayLabelInnerWidth || 0 // guard against all-day slot hidden
    )

    for (const headerLabelInnerWidth of headerLabelInnerWidthMap.values()) {
      max = Math.max(max, headerLabelInnerWidth)
    }

    for (const slatLabelInnerWidth of slatLabelInnerWidthMap.values()) {
      max = Math.max(max, slatLabelInnerWidth)
    }

    if (this.state.axisWidth !== max) {
      this.setState({ axisWidth: max })
    }
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
}
