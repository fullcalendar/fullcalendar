import { joinClassNames } from '../../util/html'
import { BaseComponent, setRef } from '../../vdom-util'
import { DateProfile } from '../../DateProfileGenerator'
import { DateRange } from '@full-ui/headless-calendar'
import { DayTableCell, DayGridRange } from '../../common/DayTableModel'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { Hit } from '../../interactions/hit'
import { Scroller } from '../../scrollgrid/Scroller'
import { ScrollerInterface } from '../../scrollgrid/ScrollerInterface'
import { ScrollerSyncerInterface } from '../../scrollgrid/ScrollerSyncerInterface'
import { getFooterScrollbarSticky, getTableHeaderSticky, getIsHeightAuto, getScrollerSyncerClass } from '../../scrollgrid/util'
import { RefMap } from '../../util/RefMap'
import { EventRangeProps } from '../../component-util/event-rendering'
import { FooterScrollbar } from '../../common/FooterScrollbar'
import { Ruler } from '../../scrollgrid/Ruler'
import { generateClassName } from '../../content-inject/ContentContainer'
import { type Ref, createRef } from 'react'
import { DayGridRows } from './DayGridRows'
import { computeColWidth, dayMicroWidth } from './util'
import { DayGridHeader } from './DayGridHeader'
import { RowConfig } from '../header-tier'
import classNames from '../../styles.module.css'
import { computeViewBorderless } from '../../util/misc'

export interface DayGridLayoutPannableProps {
  dateProfile: DateProfile
  todayRange: DateRange
  cellRows: DayTableCell[][]
  forPrint: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean

  // header content
  headerTiers: RowConfig<any, { text: string, isDisabled: boolean }>[]

  // body content
  fgEventSegs: (DayGridRange & EventRangeProps)[]
  bgEventSegs: (DayGridRange & EventRangeProps)[]
  businessHourSegs: (DayGridRange & EventRangeProps)[]
  dateSelectionSegs: (DayGridRange & EventRangeProps)[]
  eventDrag: EventSegUiInteractionState<DayGridRange> | null
  eventResize: EventSegUiInteractionState<DayGridRange> | null
  eventSelection: string

  // dimensions
  dayMinWidth: number

  // refs
  scrollerRef?: Ref<ScrollerInterface>
  rowHeightRefMap?: RefMap<string, number>
}

interface DayGridViewState {
  totalWidth?: number
  clientWidth?: number
}

export class DayGridLayoutPannable extends BaseComponent<DayGridLayoutPannableProps, DayGridViewState> {
  state = {} as DayGridViewState
  private _isUnmounting: boolean

  headerScrollerRef = createRef<Scroller>()
  bodyScrollerRef = createRef<Scroller>()
  footerScrollerRef = createRef<Scroller>()
  syncedScroller: ScrollerSyncerInterface

  render() {
    const { props, state, context } = this
    const { options } = context
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)

    const { totalWidth, clientWidth } = state
    const endScrollbarWidth = (totalWidth != null && clientWidth != null)
      ? totalWidth - clientWidth
      : undefined

    const verticalScrollbars = !props.forPrint && !getIsHeightAuto(options)
    const tableHeaderSticky = !props.forPrint && getTableHeaderSticky(options)
    const footerScrollbarSticky = !props.forPrint && getFooterScrollbarSticky(options)

    const colCount = props.cellRows[0].length
    const [canvasWidth, colWidth] = computeColWidth(colCount, props.dayMinWidth, clientWidth)
    const cellIsMicro = colWidth != null && colWidth <= dayMicroWidth
    const cellIsNarrow = cellIsMicro || (colWidth != null && colWidth <= options.dayNarrowWidth)

    return (
      <>
        {options.dayHeaders && (
          <div className={joinClassNames(
            generateClassName(options.tableHeaderClass, {
              isSticky: tableHeaderSticky,
              borderlessX,
              borderlessTop,
              borderlessBottom,
              multiMonthColumns: 0,
            }),
            classNames.printHeader, // either flexCol or table-header-group
            tableHeaderSticky && classNames.tableHeaderSticky,
          )}>
            <Scroller
              horizontal
              hideScrollbars
              className={classNames.flexRow}
              ref={this.headerScrollerRef}
            >
              <DayGridHeader
                headerTiers={props.headerTiers}
                colWidth={colWidth}
                viewportWidth={clientWidth}
                width={canvasWidth}
                cellIsNarrow={cellIsNarrow}
                cellIsMicro={cellIsMicro}
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
            </Scroller>
            <div
              className={generateClassName(options.dayHeaderDividerClass, {
                isSticky: tableHeaderSticky,
                multiMonthColumns: 0,
                options: { allDaySlot: Boolean(options.allDaySlot) },
              })}
            />
          </div>
        )}
        <Scroller
          vertical={verticalScrollbars}
          horizontal
          hideScrollbars={
            footerScrollbarSticky ||
            props.forPrint // prevents blank space in print-view on Safari
          }
          className={joinClassNames(
            generateClassName(options.tableBodyClass, {
              borderlessX,
              borderlessTop,
              borderlessBottom,
              multiMonthColumns: 0,
            }),
            // HACK for Safari. Can't do break-inside:avoid with flexbox items, likely b/c it's not standard:
            // https://stackoverflow.com/a/60256345
            !props.forPrint && classNames.flexCol,
            verticalScrollbars && classNames.liquid,
          )}
          ref={this.bodyScrollerRef}
          clientWidthRef={this.handleClientWidth}
        >
          <DayGridRows
            dateProfile={props.dateProfile}
            todayRange={props.todayRange}
            cellRows={props.cellRows}
            forPrint={props.forPrint}
            isHitComboAllowed={props.isHitComboAllowed}
            className={classNames.grow}
            dayMaxEvents={props.forPrint ? undefined : options.dayMaxEvents}
            dayMaxEventRows={options.dayMaxEventRows}

            // content
            fgEventSegs={props.fgEventSegs}
            bgEventSegs={props.bgEventSegs}
            businessHourSegs={props.businessHourSegs}
            dateSelectionSegs={props.dateSelectionSegs}
            eventDrag={props.eventDrag}
            eventResize={props.eventResize}
            eventSelection={props.eventSelection}

            // dimensions
            colWidth={colWidth}
            width={canvasWidth}
            visibleWidth={totalWidth}
            cellIsNarrow={cellIsNarrow}
            cellIsMicro={cellIsMicro}

            // refs
            rowHeightRefMap={props.rowHeightRefMap}
          />
        </Scroller>

        {Boolean(footerScrollbarSticky) && (
          <FooterScrollbar
            isSticky
            canvasWidth={canvasWidth}
            scrollerRef={this.footerScrollerRef}
          />
        )}

        <Ruler widthRef={this.handleTotalWidth} />
      </>
    )
  }

  // Lifecycle
  // -----------------------------------------------------------------------------------------------

  componentDidMount(): void {
    this._isUnmounting = false
    // scroller
    const ScrollerSyncer = getScrollerSyncerClass(this.context.pluginHooks)
    this.syncedScroller = new ScrollerSyncer(true) // horizontal=true
    setRef(this.props.scrollerRef, this.syncedScroller)
    this.updateSyncedScroller()
  }

  componentDidUpdate(): void {
    // scroller
    this.updateSyncedScroller()
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    // scroller
    this.syncedScroller.destroy()
  }

  // Sizing
  // -----------------------------------------------------------------------------------------------

  handleTotalWidth = (totalWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ totalWidth })
  }

  handleClientWidth = (clientWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ clientWidth })
  }

  // Scrolling
  // -----------------------------------------------------------------------------------------------

  updateSyncedScroller() {
    this.syncedScroller.handleChildren([
      this.headerScrollerRef.current,
      this.bodyScrollerRef.current,
      this.footerScrollerRef.current,
    ])
  }
}
