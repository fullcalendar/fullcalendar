import { CssDimValue, AllDayContentArg } from '@fullcalendar/core'
import {
  diffDays,
  SimpleScrollGridSection,
  SimpleScrollGrid,
  ChunkContentCallbackArgs,
  ScrollGridSectionConfig,
  buildNavLinkAttrs,
  ViewContainer,
  WeekNumberContainer,
  DateComponent,
  ViewProps,
  renderScrollShim,
  getStickyHeaderDates,
  getStickyFooterScrollbar,
  createFormatter,
  NowTimer,
  DateMarker,
  NowIndicatorContainer,
  ContentContainer,
} from '@fullcalendar/core/internal'
import {
  createElement,
  createRef,
  VNode,
  RefObject,
  ComponentChild,
} from '@fullcalendar/core/preact'
import { AllDaySplitter } from './AllDaySplitter.js'
import { TimeSlatMeta } from './time-slat-meta.js'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords.js'
import { TimeBodyAxis } from './TimeBodyAxis.js'

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
  private rootElRef: RefObject<HTMLElement> = createRef<HTMLElement>()
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
          <tr role="presentation" className="fc-scrollgrid-section">
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
      <ViewContainer elRef={this.rootElRef} elClasses={['fc-timegrid']} viewSpec={context.viewSpec}>
        <SimpleScrollGrid
          liquid={!props.isHeightAuto && !props.forPrint}
          collapsibleWidth={props.forPrint}
          cols={[{ width: 'shrink' }]}
          sections={sections}
        />
      </ViewContainer>
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
              <tr role="presentation">
                {this.renderHeadAxis('day', arg.rowSyncHeights[0])}
              </tr>
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
              <tr role="presentation">
                {this.renderTableRowAxis(contentArg.rowSyncHeights[0])}
              </tr>
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
          <tr role="presentation" className="fc-scrollgrid-section">
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
              <table aria-hidden style={{ height: arg.expandRows ? arg.clientHeight : '' }}>
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
                        <NowIndicatorContainer
                          elClasses={['fc-timegrid-now-indicator-arrow']}
                          elStyle={{ top: nowIndicatorTop }}
                          isAxis
                          date={nowDate}
                        />
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
      <ViewContainer elRef={this.rootElRef} elClasses={['fc-timegrid']} viewSpec={context.viewSpec}>
        <ScrollGrid
          liquid={!props.isHeightAuto && !props.forPrint}
          forPrint={props.forPrint}
          collapsibleWidth={false}
          colGroups={[
            { width: 'shrink', cols: [{ width: 'shrink' }] }, // TODO: allow no specify cols
            { cols: [{ span: colCnt, minWidth: dayMinWidth }] },
          ]}
          sections={sections}
        />
      </ViewContainer>
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

    // only do in day views (to avoid doing in week views that dont need it)
    let navLinkAttrs = (dayCnt === 1)
      ? buildNavLinkAttrs(this.context, range.start, 'week')
      : {}

    if (options.weekNumbers && rowKey === 'day') {
      return (
        <WeekNumberContainer
          elTag="th"
          elClasses={[
            'fc-timegrid-axis',
            'fc-scrollgrid-shrink',
          ]}
          elAttrs={{
            'aria-hidden': true,
          }}
          date={range.start}
          defaultFormat={DEFAULT_WEEK_NUM_FORMAT}
        >
          {(InnerContent) => (
            <div
              className={[
                'fc-timegrid-axis-frame',
                'fc-scrollgrid-shrink-frame',
                'fc-timegrid-axis-frame-liquid',
              ].join(' ')}
              style={{ height: frameHeight }}
            >
              <InnerContent
                elTag="a"
                elClasses={[
                  'fc-timegrid-axis-cushion',
                  'fc-scrollgrid-shrink-cushion',
                  'fc-scrollgrid-sync-inner',
                ]}
                elAttrs={navLinkAttrs}
              />
            </div>
          )}
        </WeekNumberContainer>
      )
    }

    return (
      <th aria-hidden className="fc-timegrid-axis">
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
    let renderProps: AllDayContentArg = {
      text: options.allDayText,
      view: viewApi,
    }

    return (
      // TODO: make reusable hook. used in list view too
      <ContentContainer
        elTag="td"
        elClasses={[
          'fc-timegrid-axis',
          'fc-scrollgrid-shrink',
        ]}
        elAttrs={{
          'aria-hidden': true,
        }}
        renderProps={renderProps}
        generatorName="allDayContent"
        customGenerator={options.allDayContent}
        defaultGenerator={renderAllDayInner}
        classNameGenerator={options.allDayClassNames}
        didMount={options.allDayDidMount}
        willUnmount={options.allDayWillUnmount}
      >
        {(InnerContent) => (
          <div
            className={[
              'fc-timegrid-axis-frame',
              'fc-scrollgrid-shrink-frame',
              rowHeight == null ? ' fc-timegrid-axis-frame-liquid' : '',
            ].join(' ')}
            style={{ height: rowHeight }}
          >
            <InnerContent
              elTag="span"
              elClasses={[
                'fc-timegrid-axis-cushion',
                'fc-scrollgrid-shrink-cushion',
                'fc-scrollgrid-sync-inner',
              ]}
            />
          </div>
        )}
      </ContentContainer>
    )
  }

  handleSlatCoords = (slatCoords: TimeColsSlatsCoords) => {
    this.setState({ slatCoords })
  }
}

function renderAllDayInner(renderProps: AllDayContentArg): ComponentChild {
  return renderProps.text
}
