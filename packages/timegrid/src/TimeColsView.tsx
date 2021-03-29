import {
  createElement, createRef,
  diffDays,
  SimpleScrollGridSection,
  VNode,
  SimpleScrollGrid,
  ChunkContentCallbackArgs,
  ScrollGridSectionConfig,
  buildNavLinkData,
  ViewRoot,
  WeekNumberRoot,
  RenderHook,
  DateComponent,
  ViewProps,
  RefObject,
  renderScrollShim,
  getStickyHeaderDates,
  getStickyFooterScrollbar,
  createFormatter,
  AllDayContentArg,
  CssDimValue,
  NowTimer,
  DateMarker,
  NowIndicatorRoot,
} from '@fullcalendar/common'
import { AllDaySplitter } from './AllDaySplitter'
import { TimeSlatMeta } from './time-slat-meta'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'
import { TimeBodyAxis } from './TimeBodyAxis'

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'short' })
const AUTO_ALL_DAY_MAX_EVENT_ROWS = 5

/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

interface TimeColsViewState {
  slatCoords: TimeColsSlatsCoords | null
}

export abstract class TimeColsView extends DateComponent<ViewProps, TimeColsViewState> {
  protected allDaySplitter = new AllDaySplitter() // for use by subclasses

  protected headerElRef: RefObject<HTMLTableCellElement> = createRef<HTMLTableCellElement>()
  private rootElRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>()
  private scrollerElRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>()

  state = {
    slatCoords: null,
  }

  // rendering
  // ----------------------------------------------------------------------------------------------------

  renderSimpleLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
  ) {
    let { context, props } = this
    let sections: SimpleScrollGridSection[] = []
    let stickyHeaderDates = getStickyHeaderDates(context.options)

    if (headerRowContent) {
      sections.push({
        type: 'header',
        key: 'header',
        isSticky: stickyHeaderDates,
        chunk: {
          elRef: this.headerElRef,
          tableClassName: 'fc-col-header',
          rowContent: headerRowContent,
        },
      })
    }

    if (allDayContent) {
      sections.push({
        type: 'body',
        key: 'all-day',
        chunk: { content: allDayContent },
      })
      sections.push({
        type: 'body',
        key: 'all-day-divider',
        outerContent: ( // TODO: rename to cellContent so don't need to define <tr>?
          <tr className="fc-scrollgrid-section">
            <td
              className={'fc-timegrid-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        ),
      })
    }

    sections.push({
      type: 'body',
      key: 'body',
      liquid: true,
      expandRows: Boolean(context.options.expandRows),
      chunk: {
        scrollerElRef: this.scrollerElRef,
        content: timeContent,
      },
    })

    return (
      <ViewRoot viewSpec={context.viewSpec} elRef={this.rootElRef}>
        {(rootElRef, classNames) => (
          <div className={['fc-timegrid'].concat(classNames).join(' ')} ref={rootElRef}>
            <SimpleScrollGrid
              liquid={!props.isHeightAuto && !props.forPrint}
              collapsibleWidth={props.forPrint}
              cols={[{ width: 'shrink' }]}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }

  renderHScrollLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    colCnt: number,
    dayMinWidth: number,
    slatMetas: TimeSlatMeta[],
    slatCoords: TimeColsSlatsCoords | null, // yuck
  ) {
    let ScrollGrid = this.context.pluginHooks.scrollGridImpl

    if (!ScrollGrid) {
      throw new Error('No ScrollGrid implementation')
    }

    let { context, props } = this
    let stickyHeaderDates = !props.forPrint && getStickyHeaderDates(context.options)
    let stickyFooterScrollbar = !props.forPrint && getStickyFooterScrollbar(context.options)
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'header',
        key: 'header',
        isSticky: stickyHeaderDates,
        syncRowHeights: true,
        chunks: [
          {
            key: 'axis',
            rowContent: (arg: ChunkContentCallbackArgs) => (
              <tr>{this.renderHeadAxis('day', arg.rowSyncHeights[0])}</tr>
            ),
          },
          {
            key: 'cols',
            elRef: this.headerElRef,
            tableClassName: 'fc-col-header',
            rowContent: headerRowContent,
          },
        ],
      })
    }

    if (allDayContent) {
      sections.push({
        type: 'body',
        key: 'all-day',
        syncRowHeights: true,
        chunks: [
          {
            key: 'axis',
            rowContent: (contentArg: ChunkContentCallbackArgs) => (
              <tr>{this.renderTableRowAxis(contentArg.rowSyncHeights[0])}</tr>
            ),
          },
          {
            key: 'cols',
            content: allDayContent,
          },
        ],
      })
      sections.push({
        key: 'all-day-divider',
        type: 'body',
        outerContent: ( // TODO: rename to cellContent so don't need to define <tr>?
          <tr className="fc-scrollgrid-section">
            <td
              colSpan={2}
              className={'fc-timegrid-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        ),
      })
    }

    let isNowIndicator = context.options.nowIndicator

    sections.push({
      type: 'body',
      key: 'body',
      liquid: true,
      expandRows: Boolean(context.options.expandRows),
      chunks: [
        {
          key: 'axis',
          content: (arg) => (
            // TODO: make this now-indicator arrow more DRY with TimeColsContent
            <div className="fc-timegrid-axis-chunk">
              <table style={{ height: arg.expandRows ? arg.clientHeight : '' }}>
                {arg.tableColGroupNode}
                <tbody>
                  <TimeBodyAxis slatMetas={slatMetas} />
                </tbody>
              </table>
              <div className="fc-timegrid-now-indicator-container">
                <NowTimer unit={isNowIndicator ? 'minute' : 'day' /* hacky */}>
                  {(nowDate: DateMarker) => {
                    let nowIndicatorTop =
                      isNowIndicator &&
                      slatCoords &&
                      slatCoords.safeComputeTop(nowDate) // might return void

                    if (typeof nowIndicatorTop === 'number') {
                      return (
                        <NowIndicatorRoot isAxis date={nowDate}>
                          {(rootElRef, classNames, innerElRef, innerContent) => (
                            <div
                              ref={rootElRef}
                              className={['fc-timegrid-now-indicator-arrow'].concat(classNames).join(' ')}
                              style={{ top: nowIndicatorTop }}
                            >
                              {innerContent}
                            </div>
                          )}
                        </NowIndicatorRoot>
                      )
                    }

                    return null
                  }}
                </NowTimer>
              </div>
            </div>
          ),
        },
        {
          key: 'cols',
          scrollerElRef: this.scrollerElRef,
          content: timeContent,
        },
      ],
    })

    if (stickyFooterScrollbar) {
      sections.push({
        key: 'footer',
        type: 'footer',
        isSticky: true,
        chunks: [
          {
            key: 'axis',
            content: renderScrollShim,
          },
          {
            key: 'cols',
            content: renderScrollShim,
          },
        ],
      })
    }

    return (
      <ViewRoot viewSpec={context.viewSpec} elRef={this.rootElRef}>
        {(rootElRef, classNames) => (
          <div className={['fc-timegrid'].concat(classNames).join(' ')} ref={rootElRef}>
            <ScrollGrid
              liquid={!props.isHeightAuto && !props.forPrint}
              collapsibleWidth={false}
              colGroups={[
                { width: 'shrink', cols: [{ width: 'shrink' }] }, // TODO: allow no specify cols
                { cols: [{ span: colCnt, minWidth: dayMinWidth }] },
              ]}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }

  handleScrollTopRequest = (scrollTop: number) => {
    let scrollerEl = this.scrollerElRef.current

    if (scrollerEl) { // TODO: not sure how this could ever be null. weirdness with the reducer
      scrollerEl.scrollTop = scrollTop
    }
  }

  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/

  getAllDayMaxEventProps() {
    let { dayMaxEvents, dayMaxEventRows } = this.context.options

    if (dayMaxEvents === true || dayMaxEventRows === true) { // is auto?
      dayMaxEvents = undefined
      dayMaxEventRows = AUTO_ALL_DAY_MAX_EVENT_ROWS // make sure "auto" goes to a real number
    }

    return { dayMaxEvents, dayMaxEventRows }
  }

  /* Header Render Methods
  ------------------------------------------------------------------------------------------------------------------*/

  renderHeadAxis = (rowKey: 'day' | string, frameHeight: CssDimValue = '') => {
    let { options } = this.context
    let { dateProfile } = this.props
    let range = dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)

    let navLinkAttrs = (options.navLinks && dayCnt === 1) // only do in day views (to avoid doing in week views that dont need it)
      ? { 'data-navlink': buildNavLinkData(range.start, 'week'), tabIndex: 0 }
      : {}

    if (options.weekNumbers && rowKey === 'day') {
      return (
        <WeekNumberRoot date={range.start} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
          {(rootElRef, classNames, innerElRef, innerContent) => (
            <th
              ref={rootElRef}
              className={[
                'fc-timegrid-axis',
                'fc-scrollgrid-shrink',
              ].concat(classNames).join(' ')}
            >
              <div
                className="fc-timegrid-axis-frame fc-scrollgrid-shrink-frame fc-timegrid-axis-frame-liquid"
                style={{ height: frameHeight }}
              >
                <a
                  ref={innerElRef}
                  className="fc-timegrid-axis-cushion fc-scrollgrid-shrink-cushion fc-scrollgrid-sync-inner"
                  {...navLinkAttrs}
                >
                  {innerContent}
                </a>
              </div>
            </th>
          )}
        </WeekNumberRoot>
      )
    }

    return (
      <th className="fc-timegrid-axis">
        <div className="fc-timegrid-axis-frame" style={{ height: frameHeight }} />
      </th>
    )
  }

  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/

  // only a one-way height sync. we don't send the axis inner-content height to the DayGrid,
  // but DayGrid still needs to have classNames on inner elements in order to measure.
  renderTableRowAxis = (rowHeight?: number) => {
    let { options, viewApi } = this.context
    let hookProps: AllDayContentArg = {
      text: options.allDayText,
      view: viewApi,
    }

    return (
      // TODO: make reusable hook. used in list view too
      <RenderHook<AllDayContentArg>
        hookProps={hookProps}
        classNames={options.allDayClassNames}
        content={options.allDayContent}
        defaultContent={renderAllDayInner}
        didMount={options.allDayDidMount}
        willUnmount={options.allDayWillUnmount}
      >
        {(rootElRef, classNames, innerElRef, innerContent) => (
          <td
            ref={rootElRef}
            className={[
              'fc-timegrid-axis',
              'fc-scrollgrid-shrink',
            ].concat(classNames).join(' ')}
          >
            <div
              className={'fc-timegrid-axis-frame fc-scrollgrid-shrink-frame' + (rowHeight == null ? ' fc-timegrid-axis-frame-liquid' : '')}
              style={{ height: rowHeight }}
            >
              <span className="fc-timegrid-axis-cushion fc-scrollgrid-shrink-cushion fc-scrollgrid-sync-inner" ref={innerElRef}>
                {innerContent}
              </span>
            </div>
          </td>
        )}
      </RenderHook>
    )
  }

  handleSlatCoords = (slatCoords: TimeColsSlatsCoords) => {
    this.setState({ slatCoords })
  }
}

function renderAllDayInner(hookProps) {
  return hookProps.text
}
