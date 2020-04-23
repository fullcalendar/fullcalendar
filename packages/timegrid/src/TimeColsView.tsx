import {
  h, createRef,
  diffDays,
  SimpleScrollGridSection,
  VNode,
  SimpleScrollGrid,
  ChunkContentCallbackArgs,
  ScrollGridSectionConfig,
  BaseComponent,
  buildNavLinkData,
  ViewRoot,
  WeekNumberRoot,
  RenderHook,
  DateComponent,
  ViewProps,
  RefObject,
  renderScrollShim,
  getStickyHeaderDates,
  getStickyFooterScrollbar
} from '@fullcalendar/core'
import { AllDaySplitter } from './AllDaySplitter'
import { TimeSlatMeta, TimeColsAxisCell } from './TimeColsSlats'


const DEFAULT_WEEK_NUM_FORMAT = { week: 'short' }
const AUTO_ALL_DAY_MAX_EVENT_ROWS = 5


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export abstract class TimeColsView extends DateComponent<ViewProps> {

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses

  protected headerElRef: RefObject<HTMLTableCellElement> = createRef<HTMLTableCellElement>()
  private rootElRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>()
  private scrollerElRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>()


  // rendering
  // ----------------------------------------------------------------------------------------------------


  renderSimpleLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null
  ) {
    let { context, props } = this
    let sections: SimpleScrollGridSection[] = []
    let stickyHeaderDates = getStickyHeaderDates(context.options)

    if (headerRowContent) {
      sections.push({
        type: 'header',
        isSticky: stickyHeaderDates,
        chunk: {
          elRef: this.headerElRef,
          tableClassName: 'fc-col-header',
          rowContent: headerRowContent
        }
      })
    }

    if (allDayContent) {
      sections.push({
        key: 'all-day',
        type: 'body',
        chunk: { content: allDayContent }
      })
      sections.push({
        outerContent: (
          <tr className='fc-scrollgrid-section fc-scrollgrid-section-body'>
            <td
              className={'fc-timegrid-divider fc-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        )
      })
    }

    sections.push({
      key: 'timed',
      type: 'body',
      liquid: true,
      expandRows: Boolean(context.options.expandRows),
      chunk: {
        scrollerElRef: this.scrollerElRef,
        content: timeContent
      }
    })

    return (
      <ViewRoot viewSpec={context.viewSpec} elRef={this.rootElRef}>
        {(rootElRef, classNames) => (
          <div className={[ 'fc-timegrid' ].concat(classNames).join(' ')} ref={rootElRef}>
            <SimpleScrollGrid
              forPrint={props.forPrint}
              liquid={!props.isHeightAuto}
              cols={[ { width: 'shrink' } ]}
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
    slatMetas: TimeSlatMeta[]
  ) {
    let ScrollGrid = this.context.pluginHooks.scrollGridImpl

    if (!ScrollGrid) {
      throw new Error('No ScrollGrid implementation')
    }

    let { context, props } = this
    let stickyHeaderDates = getStickyHeaderDates(context.options)
    let stickyFooterScrollbar = getStickyFooterScrollbar(context.options)
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'header',
        isSticky: stickyHeaderDates,
        chunks: [
          {
            rowContent: <tr>{this.renderHeadAxis()}</tr>
          },
          {
            elRef: this.headerElRef,
            tableClassName: 'fc-col-header',
            rowContent: headerRowContent
          }
        ]
      })
    }

    if (allDayContent) {
      sections.push({
        key: 'all-day',
        type: 'body',
        syncRowHeights: true,
        chunks: [
          {
            rowContent: (contentArg: ChunkContentCallbackArgs) => (
              <tr>{this.renderTableRowAxis(contentArg.rowSyncHeights[0])}</tr>
            ),
          },
          {
            content: allDayContent
          }
        ]
      })
      sections.push({
        outerContent: (
          <tr className='fc-scrollgrid-section fc-scrollgrid-section-body'>
            <td
              colSpan={2}
              className={'fc-timegrid-divider fc-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        )
      })
    }

    sections.push({
      key: 'timed',
      type: 'body',
      liquid: true,
      expandRows: Boolean(context.options.expandRows),
      chunks: [
        {
          rowContent: <TimeBodyAxis slatMetas={slatMetas} />
        },
        {
          scrollerElRef: this.scrollerElRef,
          content: timeContent
        }
      ]
    })

    if (stickyFooterScrollbar) {
      sections.push({
        key: 'scroll',
        type: 'footer',
        isSticky: true,
        chunks: [
          { content: renderScrollShim },
          { content: renderScrollShim }
        ]
      })
    }

    return (
      <ViewRoot viewSpec={context.viewSpec} elRef={this.rootElRef}>
        {(rootElRef, classNames) => (
          <div className={[ 'fc-timegrid' ].concat(classNames).join(' ')} ref={rootElRef}>
            <ScrollGrid
              forPrint={props.forPrint}
              liquid={!props.isHeightAuto}
              colGroups={[
                { width: 'shrink', cols: [ { width: 'shrink' } ] }, // TODO: allow no specify cols
                { cols: [ { span: colCnt, minWidth: dayMinWidth } ] }
              ]}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }


  handleScrollTopRequest = (scrollTop: number) => {
    this.scrollerElRef.current.scrollTop = scrollTop
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


  renderHeadAxis = () => {
    let { options } = this.context
    let { dateProfile } = this.props
    let range = dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let navLinkData = (options.navLinks && dayCnt === 1) // only do in day views (to avoid doing in week views that dont need it)
      ? buildNavLinkData(range.start, 'week')
      : null

    if (options.weekNumbers) {
      return (
        <WeekNumberRoot date={range.start} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
          {(rootElRef, classNames, innerElRef, innerContent) => (
            <th ref={rootElRef} className={[
              'fc-timegrid-axis',
              'fc-scrollgrid-shrink'
            ].concat(classNames).join(' ')}>
              <div className='fc-timegrid-axis-frame fc-scrollgrid-shrink-frame fc-timegrid-axis-frame-liquid'>
                <a className='fc-timegrid-axis-cushion fc-scrollgrid-shrink-cushion' data-navlink={navLinkData} ref={innerElRef}>
                  {innerContent}
                </a>
              </div>
            </th>
          )}
        </WeekNumberRoot>
      )
    }

    return (
      <th className='fc-timegrid-axis'></th>
    )
  }


  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // only a one-way height sync. we don't send the axis inner-content height to the DayGrid,
  // but DayGrid still needs to have classNames on inner elements in order to measure.
  renderTableRowAxis = (rowHeight?: number) => {
    let { context } = this
    let hookProps = {
      text: context.options.allDayText,
      view: context.viewApi
    }

    return (
      // TODO: make reusable hook. used in list view too
      <RenderHook name='allDay' hookProps={hookProps} defaultContent={renderAllDayInner}>
        {(rootElRef, classNames, innerElRef, innerContent) => (
          <td ref={rootElRef} className={[
            'fc-timegrid-axis',
            'fc-scrollgrid-shrink'
          ].concat(classNames).join(' ')}>
            <div className={'fc-timegrid-axis-frame fc-scrollgrid-shrink-frame' + (rowHeight == null ? ' fc-timegrid-axis-frame-liquid' : '')} style={{ height: rowHeight }}>
              <span className='fc-timegrid-axis-cushion fc-scrollgrid-shrink-cushion' ref={innerElRef}>
                {innerContent}
              </span>
            </div>
          </td>
        )}
      </RenderHook>
    )
  }

}

function renderAllDayInner(hookProps) {
  return hookProps.text
}


/* Thin Axis
------------------------------------------------------------------------------------------------------------------*/

interface TimeBodyAxisProps {
  slatMetas: TimeSlatMeta[]
}

class TimeBodyAxis extends BaseComponent<TimeBodyAxisProps> {

  render() {
    return this.props.slatMetas.map((slatMeta: TimeSlatMeta) => (
      <tr>
        <TimeColsAxisCell {...slatMeta} />
      </tr>
    ))
  }

}
