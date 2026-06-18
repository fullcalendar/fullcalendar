import { CssDimValue } from '../../scrollgrid/util'
import { joinClassNames } from '../../util/html'
import { afterSize, watchHeight } from '../../component-util/resize-observer'
import { buildNavLinkAttrs } from '../../common/nav-link'
import { DateComponent } from '../../component/DateComponent'
import { DateFormatter, DateRange, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { DayTableCell } from '../../common/DayTableModel'
import { generateClassName } from '../../content-inject/ContentContainer'
import { memoize } from '../../util/memoize'
import { RefMap } from '../../util/RefMap'
import { setRef } from '../../vdom-util'
import { Ruler } from '../../scrollgrid/Ruler'
import { ViewProps } from '../../component-util/View'
import classNames from '../../styles.module.css'
import { createRef, type Ref } from 'react'
import { buildDateRowConfig } from '../../daygrid/header-tier'
import { buildDayTableModel, createDayHeaderFormatter, dayMicroWidth } from '../../daygrid/components/util'
import { DayGridRows } from '../../daygrid/components/DayGridRows'
import { DayTableSlicer } from '../../daygrid/DayTableSlicer'
import { DayGridHeaderRow } from '../../daygrid/components/DayGridHeaderRow'
import { computeViewBorderless } from '../../util/misc'
import { SingleMonthInfo, SingleMonthHeaderInfo } from '../structs'

export interface SingleMonthHeights {
  titleHeight: number
  tableHeaderHeight: number
  rowHeightMap: Map<string, number>
  cellRows: DayTableCell[][] // HACK. not dimension-related
}

export interface SingleMonthProps extends ViewProps {
  todayRange: DateRange
  isoDateStr?: string
  titleFormat: DateFormatter
  width?: CssDimValue
  colCount?: number // # of MONTHS, not day columns
  isFirst: boolean
  isLast: boolean
  hasLateralSiblings: boolean // TODO: use lower-level indicator instead of referencing siblings
  heightsRef?: Ref<SingleMonthHeights>
}

interface SingleMonthState {
  gridWidth?: number
  titleHeight?: number
  tableHeaderHeight?: number
}

export class SingleMonth extends DateComponent<SingleMonthProps, SingleMonthState> {
  state = {} as SingleMonthState

  // memo
  private buildDayTableModel = memoize(buildDayTableModel)
  private createDayHeaderFormatter = memoize(createDayHeaderFormatter)
  private buildDateRowConfig = memoize(buildDateRowConfig)

  // ref
  private titleElRef = createRef<HTMLDivElement>()
  private tableHeaderElRef = createRef<HTMLDivElement>()
  private rowHeightRefMap = new RefMap<string, number>(() => {
    afterSize(this.handleHeights)
  })

  // internal
  private _isUnmounting: boolean
  private slicer = new DayTableSlicer()
  private rootEl?: HTMLElement
  private renderProps?: SingleMonthInfo

  private get titleId() {
    return this.context.baseId + 'month-' + this.props.isoDateStr
  }
  private disconnectTitleHeight?: () => void
  private disconnectTableHeaderHeight?: () => void
  private cellRows: DayTableCell[][]

  render() {
    const { props, state, context } = this
    const { dateProfile, forPrint } = props
    const { options, dateEnv } = context
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)
    const dayTableModel = this.buildDayTableModel(dateProfile, context.dateProfileGenerator, dateEnv)
    const slicedProps = this.slicer.sliceProps(props, dateProfile, options.nextDayThreshold, context, dayTableModel)

    const dayHeaderFormat = this.createDayHeaderFormatter(
      options.dayHeaderFormat,
      false, // datesRepDistinctDays
      dayTableModel.colCount,
    )
    const rowConfig = this.buildDateRowConfig(
      dayTableModel.headerDates,
      false, // datesRepDistinctDays
      dateProfile,
      props.todayRange,
      dayHeaderFormat,
      context,
    )

    this.cellRows = dayTableModel.cellRows

    const isTitleAndHeaderSticky = !forPrint && props.colCount === 1
    const isAspectRatio = !forPrint || props.hasLateralSiblings

    const cellColCnt = dayTableModel.cellRows[0].length
    const colWidth = state.gridWidth != null ? state.gridWidth / cellColCnt : undefined
    const cellIsMicro = colWidth != null && colWidth <= dayMicroWidth
    const cellIsNarrow = cellIsMicro || (colWidth != null && colWidth <= options.dayNarrowWidth)

    const rowHeightGuess = state.gridWidth != null
      ? (1 / options.aspectRatio) * state.gridWidth / 6
      : undefined

    const headerStickyBottom = isTitleAndHeaderSticky
      ? rowHeightGuess
      : undefined

    const titleStickyBottom = isTitleAndHeaderSticky && rowHeightGuess != null && state.tableHeaderHeight != null
      ? rowHeightGuess + state.tableHeaderHeight + 1
      : undefined
    const businessHourSegs = forPrint ? [] : slicedProps.businessHourSegs
    const dateSelectionSegs = forPrint ? [] : slicedProps.dateSelectionSegs
    const eventDrag = forPrint ? null : slicedProps.eventDrag
    const eventResize = forPrint ? null : slicedProps.eventResize

    const hasNavLink = options.navLinks && props.colCount > 1
    const headerRenderProps: SingleMonthHeaderInfo = {
      multiMonthColumns: props.colCount || 0,
      isSticky: isTitleAndHeaderSticky,
      isNarrow: cellIsNarrow,
      hasNavLink,
    }
    const monthStartDate = props.dateProfile.currentRange.start
    const navLinkAttrs: any = hasNavLink
      ? buildNavLinkAttrs(context, monthStartDate, 'month', props.isoDateStr)
      : {}

    return (
      <div // TODO: move this to the parent component?
        role='listitem'
        style={{ width: props.width }}
      >
        <div
          role='grid'
          aria-labelledby={this.titleId}
          data-date={props.isoDateStr}
          className={joinClassNames(
            generateClassName(options.singleMonthClass, {
              isFirst: props.isFirst,
              isLast: props.isLast,
              multiMonthColumns: props.colCount || 0,
            }),
            classNames.flexCol,
            props.hasLateralSiblings && classNames.breakInsideAvoid,
          )}
        >
          <Ruler widthRef={this.handleGridWidth} />
          <div
            id={this.titleId}
            ref={this.titleElRef}
            className={joinClassNames(
              generateClassName(options.singleMonthHeaderClass, headerRenderProps),
              isTitleAndHeaderSticky && classNames.stickyT,
              classNames.flexCol,
            )}
            style={{
              // HACK to keep zIndex above table-header,
              // because in Chrome, something about position:sticky on this title div
              // causes its bottom border to no be considered part of its mass,
              // and would get overlapped and hidden by the table-header div
              zIndex: isTitleAndHeaderSticky ? 3 : undefined, // TODO: className?
              marginBottom: titleStickyBottom,
            }}
          >
            <div
              {...navLinkAttrs}
              className={joinClassNames(
                generateClassName(options.singleMonthHeaderInnerClass, headerRenderProps),
                navLinkAttrs.className,
              )}
            >
              {joinDateTimeFormatParts(dateEnv.formatToParts(monthStartDate, props.titleFormat))}
            </div>
          </div>
          <div // the daygrid table
            className={joinClassNames(
              generateClassName(options.tableClass, {
                borderlessX,
                borderlessTop,
                borderlessBottom,
                multiMonthColumns: props.colCount || 0,
              }),
              classNames.flexCol,
            )}
            style={{
              marginTop: titleStickyBottom != null ? -titleStickyBottom : undefined,
            }}
          >
            <div
              ref={this.tableHeaderElRef}
              className={joinClassNames(
                generateClassName(options.tableHeaderClass, {
                  isSticky: isTitleAndHeaderSticky,
                  borderlessX,
                  borderlessTop,
                  borderlessBottom,
                  multiMonthColumns: props.colCount || 0,
                }),
                classNames.flexCol,
                isTitleAndHeaderSticky && classNames.sticky,
              )}
              style={{
                zIndex: isTitleAndHeaderSticky ? 2 : undefined, // TODO: className?
                top: isTitleAndHeaderSticky ? state.titleHeight : 0,
                marginBottom: headerStickyBottom,
              }}
            >
              <DayGridHeaderRow
                {...rowConfig}
                role='row'
                borderBottom={false}
                cellIsNarrow={cellIsNarrow}
                cellIsMicro={cellIsMicro}
                rowLevel={0}
              />
              <div
                className={generateClassName(options.dayHeaderDividerClass, {
                  isSticky: isTitleAndHeaderSticky,
                  multiMonthColumns: props.colCount || 0,
                  options: { allDaySlot: Boolean(options.allDaySlot) },
                })}
              />
            </div>
            <div
              className={joinClassNames(
                generateClassName(options.tableBodyClass, {
                  borderlessX,
                  borderlessTop,
                  borderlessBottom,
                  multiMonthColumns: props.colCount || 0,
                }),
                classNames.flexCol,
                isAspectRatio && classNames.rel,
              )}
              style={{
                zIndex: isTitleAndHeaderSticky ? 1 : undefined, // TODO: className?
                marginTop: headerStickyBottom != null ? -headerStickyBottom : undefined,
                aspectRatio: isAspectRatio ? String(options.aspectRatio) : undefined,
              }}
            >
              <DayGridRows
                dateProfile={props.dateProfile}
                todayRange={props.todayRange}
                cellRows={dayTableModel.cellRows}
                className={isAspectRatio ? classNames.fill : ''}
                forPrint={forPrint && !props.hasLateralSiblings}
                dayMaxEventRows={
                  (forPrint && props.hasLateralSiblings)
                    ? 1 // for side-by-side multimonths, limit to one row
                    : true // otherwise, always do +more link, never expand rows
                }

                // content
                fgEventSegs={slicedProps.fgEventSegs}
                bgEventSegs={slicedProps.bgEventSegs}
                businessHourSegs={businessHourSegs}
                dateSelectionSegs={dateSelectionSegs}
                eventDrag={eventDrag}
                eventResize={eventResize}
                eventSelection={slicedProps.eventSelection}

                // dimensions
                visibleWidth={state.gridWidth}
                cellIsNarrow={cellIsNarrow}
                cellIsMicro={cellIsMicro}
                rowHeightRefMap={this.rowHeightRefMap}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  handleEl = (el: HTMLElement) => {
    const { options } = this.context

    if (el) {
      this.rootEl = el

      options.singleMonthDidMount?.({
        el: this.rootEl,
        ...this.renderProps!,
      })
    }
  }

  // HACK for sync access
  private tableHeaderHeight: number
  private titleHeight: number

  componentDidMount(): void {
    this._isUnmounting = false
    this.disconnectTitleHeight = watchHeight(this.titleElRef.current, (height) => {
      this.setState({ titleHeight: this.titleHeight = height })
      afterSize(this.handleHeights)
    })
    this.disconnectTableHeaderHeight = watchHeight(this.tableHeaderElRef.current, (height) => {
      this.setState({ tableHeaderHeight: this.tableHeaderHeight = height })
      afterSize(this.handleHeights)
    })
  }

  componentWillUnmount(): void {
    const { options } = this.context

    this._isUnmounting = true
    this.disconnectTitleHeight()
    this.disconnectTableHeaderHeight()

    options.singleMonthWillUnmount?.({
      el: this.rootEl,
      ...this.renderProps!,
    })
  }

  private handleGridWidth = (gridWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ gridWidth })
  }

  private handleHeights = () => {
    if (this._isUnmounting) return
    setRef(this.props.heightsRef, {
      titleHeight: this.titleHeight,
      tableHeaderHeight: this.tableHeaderHeight,
      rowHeightMap: this.rowHeightRefMap.current,
      cellRows: this.cellRows,
    })
  }
}
