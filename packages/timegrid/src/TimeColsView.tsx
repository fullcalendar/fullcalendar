import {
  h, createRef,
  View,
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
  RenderHook
} from '@fullcalendar/core'
import AllDaySplitter from './AllDaySplitter'
import { TimeSlatMeta, TimeColsAxisCell } from './TimeColsSlats'


const DEFAULT_WEEK_NUM_FORMAT = { week: 'short' }
const AUTO_ALL_DAY_EVENT_LIMIT = 5


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeColsView extends View {

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses
  protected headerElRef = createRef<HTMLTableCellElement>()
  private rootElRef = createRef<HTMLDivElement>()
  private scrollerElRef = createRef<HTMLDivElement>()


  // rendering
  // ----------------------------------------------------------------------------------------------------


  renderSimpleLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null
  ) {
    let { context, props } = this
    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
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
        chunk: {
          content: allDayContent
        }
      })
      sections.push({
        outerContent: (
          <tr>
            <td
              class={'fc-timegrid-divider fc-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        )
      })
    }

    sections.push({
      key: 'timed',
      type: 'body',
      vGrow: true,
      vGrowRows: Boolean(context.options.expandRows),
      chunk: {
        scrollerElRef: this.scrollerElRef,
        content: timeContent
      }
    })

    return (
      <ViewRoot viewSpec={props.viewSpec} elRef={this.rootElRef}>
        {(rootElRef, classNames) => (
          <div class={[ 'fc-timegrid' ].concat(classNames).join(' ')} ref={rootElRef}>
            <SimpleScrollGrid
              forPrint={props.forPrint}
              vGrow={!props.isHeightAuto}
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
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
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
          <tr>
            <td
              colSpan={2}
              class={'fc-timegrid-divider fc-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        )
      })
    }

    sections.push({
      key: 'timed',
      type: 'body',
      vGrow: true,
      vGrowRows: Boolean(context.options.expandRows),
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

    return (
      <ViewRoot viewSpec={props.viewSpec} elRef={this.rootElRef}>
        {(rootElRef, classNames) => (
          <div class={[ 'fc-timegrid' ].concat(classNames).join(' ')} ref={rootElRef}>
            <ScrollGrid
              forPrint={props.forPrint}
              vGrow={!props.isHeightAuto}
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


  getAllDayEventLimit() {
    let eventLimit = this.context.options.eventLimit
    if (eventLimit && typeof eventLimit !== 'number') {
      eventLimit = AUTO_ALL_DAY_EVENT_LIMIT // make sure "auto" goes to a real number
    }
    return eventLimit
  }



  /* Header Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  renderHeadAxis = () => {
    let { options } = this.context
    let range = this.props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let navLinkData = (options.navLinks && dayCnt === 1) // only do in day views (to avoid doing in week views that dont need it)
      ? buildNavLinkData(range.start, 'week')
      : null

    if (options.weekNumbers) {
      return (
        <WeekNumberRoot date={range.start} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
          {(rootElRef, classNames, innerElRef, innerContent) => (
            <th ref={rootElRef} class={[
              'fc-timegrid-axis',
              'fc-scrollgrid-shrink',
              'fc-week-number' // TODO: make part of WeekNumberRoot
            ].concat(classNames).join(' ')}>
              <div class='fc-timegrid-axis-frame fc-scrollgrid-shrink-frame'>
                <a class='fc-timegrid-axis-cushion fc-scrollgrid-shrink-cushion' data-navlink={navLinkData} ref={innerElRef}>
                  {innerContent}
                </a>
              </div>
            </th>
          )}
        </WeekNumberRoot>
      )
    }

    return (
      <th class='fc-timegrid-axis'></th>
    )
  }


  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // only a one-way height sync. we don't send the axis inner-content height to the DayGrid,
  // but DayGrid still needs to have classNames on inner elements in order to measure.
  renderTableRowAxis = (rowHeight?: number) => {
    let innerProps = { view: this.context.view }

    return (
      <RenderHook name='allDay' mountProps={innerProps} dynamicProps={innerProps}>
        {(rootElRef, classNames, innerElRef, innerContent) => (
          <td ref={rootElRef} className={[
            'fc-timegrid-axis',
            'fc-scrollgrid-shrink'
          ].concat(classNames).join(' ')}>
            <div class={'fc-timegrid-axis-frame fc-scrollgrid-shrink-frame' + (rowHeight == null ? ' vgrow' : '')} style={{ height: rowHeight }}>
              <span class='fc-timegrid-axis-cushion fc-scrollgrid-shrink-cushion' ref={innerElRef}>
                {innerContent}
              </span>
            </div>
          </td>
        )}
      </RenderHook>
    )
  }

}

TimeColsView.prototype.usesMinMaxTime = true // indicates that slotMinTime/slotMaxTime affects rendering


/* Thin Axis
------------------------------------------------------------------------------------------------------------------*/

interface TimeBodyAxisProps {
  slatMetas: TimeSlatMeta[]
}

class TimeBodyAxis extends BaseComponent<TimeBodyAxisProps> {

  render(props: TimeBodyAxisProps) {
    return props.slatMetas.map((slatMeta: TimeSlatMeta) => (
      <tr>
        <TimeColsAxisCell {...slatMeta} />
      </tr>
    ))
  }

}
